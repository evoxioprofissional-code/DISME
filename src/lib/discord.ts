import "server-only";
import { resolveBadges } from "@/lib/badges";
import type { DiscordPublicUser } from "@/types/discord";

const DISCORD_EPOCH = BigInt("1420070400000");
const SNOWFLAKE_SHIFT = BigInt(22);
const DEFAULT_AVATAR_COUNT = BigInt(6);

export interface DiscordApiUser {
  id: string;
  username: string;
  discriminator?: string;
  global_name?: string | null;
  avatar?: string | null;
  bot?: boolean;
  system?: boolean;
  banner?: string | null;
  accent_color?: number | null;
  public_flags?: number;
  premium_type?: number | null;
  premium_since?: string | null;
  avatar_decoration_data?: { asset: string; sku_id: string; expires_at?: number | string | null } | null;
  collectibles?: Record<string, unknown> | null;
  primary_guild?: {
    identity_guild_id?: string | null;
    identity_enabled?: boolean | null;
    tag?: string | null;
    badge?: string | null;
  } | null;
}

export function isDiscordId(value: string) {
  return /^\d{17,20}$/.test(value);
}

export function discordAccountCreatedAt(id: string) {
  const milliseconds = (BigInt(id) >> SNOWFLAKE_SHIFT) + DISCORD_EPOCH;
  return new Date(Number(milliseconds)).toISOString();
}

export function discordAvatarUrl(id: string, hash?: string | null) {
  if (hash) return discordAvatarAssetUrl(id, hash, 512) as string;
  const index = Number((BigInt(id) >> SNOWFLAKE_SHIFT) % DEFAULT_AVATAR_COUNT);
  return `https://cdn.discordapp.com/embed/avatars/${index}.png`;
}

export function discordAvatarAssetUrl(id: string, hash: string | null, size = 1024) {
  if (!hash) return null;
  const extension = hash.startsWith("a_") ? "gif" : "webp";
  return `https://cdn.discordapp.com/avatars/${id}/${hash}.${extension}?size=${size}`;
}

export function discordBannerUrl(id: string, hash?: string | null) {
  if (!hash) return null;
  const extension = hash.startsWith("a_") ? "gif" : "webp";
  return `https://cdn.discordapp.com/banners/${id}/${hash}.${extension}?size=1024`;
}

/** Snowflake breakdown — timestamp + internal worker/process/increment ids. */
export function discordSnowflakeParts(id: string) {
  const big = BigInt(id);
  const timestamp = new Date(Number((big >> SNOWFLAKE_SHIFT) + DISCORD_EPOCH)).toISOString();
  return {
    timestamp,
    workerId: Number((big >> BigInt(17)) & BigInt(0x1f)),
    processId: Number((big >> BigInt(12)) & BigInt(0x1f)),
    increment: Number(big & BigInt(0xfff)),
  };
}

interface Nameplate {
  label: string | null;
  palette: string | null;
  imageUrl: string | null;
}

function resolveNameplate(collectibles: Record<string, unknown> | null | undefined): Nameplate | null {
  if (!collectibles || typeof collectibles !== "object") return null;
  const nameplate = (collectibles as { nameplate?: unknown }).nameplate;
  if (!nameplate || typeof nameplate !== "object") return null;
  const data = nameplate as { asset?: unknown; label?: unknown; palette?: unknown };
  const asset = typeof data.asset === "string" ? data.asset : null;
  return {
    label: typeof data.label === "string" ? data.label : null,
    palette: typeof data.palette === "string" ? data.palette : null,
    imageUrl: asset ? `https://cdn.discordapp.com/assets/collectibles/${asset}static.png` : null,
  };
}

function decorationExpiry(value: number | string | null | undefined): string | null {
  if (value == null) return null;
  if (typeof value === "number") return new Date(value * 1000).toISOString();
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? null : new Date(parsed).toISOString();
}

function computeFlairs(createdAt: string, animated: boolean): string[] {
  const flairs: string[] = [];
  const year = new Date(createdAt).getUTCFullYear();
  if (year <= 2015) flairs.push("Conta OG · pré-2016");
  else if (year <= 2017) flairs.push("Conta antiga");
  if (animated) flairs.push("Perfil animado");
  return flairs;
}

export function normalizeDiscordUser(
  user: DiscordApiUser,
  timestamps: { firstSeenAt: string; lastSeenAt: string },
): DiscordPublicUser {
  const primaryGuild = user.primary_guild?.identity_enabled
    ? {
        tag: user.primary_guild.tag ?? null,
        badgeUrl:
          user.primary_guild.identity_guild_id && user.primary_guild.badge
            ? `https://cdn.discordapp.com/clan-badges/${user.primary_guild.identity_guild_id}/${user.primary_guild.badge}.png?size=64`
            : null,
      }
    : null;

  const accountCreatedAt = discordAccountCreatedAt(user.id);
  const avatarAnimated = Boolean(user.avatar?.startsWith("a_"));
  const bannerAnimated = Boolean(user.banner?.startsWith("a_"));
  const nameplate = resolveNameplate(user.collectibles);
  const hasDecoration = Boolean(user.avatar_decoration_data?.asset);
  const nitroLikely =
    (user.premium_type != null && user.premium_type > 0) ||
    avatarAnimated ||
    bannerAnimated ||
    hasDecoration ||
    Boolean(nameplate);

  return {
    id: user.id,
    username: user.username,
    displayName: user.global_name ?? null,
    discriminator: user.discriminator && user.discriminator !== "0" ? user.discriminator : null,
    avatarUrl: discordAvatarUrl(user.id, user.avatar),
    avatarHash: user.avatar ?? null,
    avatarAnimated,
    bannerUrl: discordBannerUrl(user.id, user.banner),
    bannerHash: user.banner ?? null,
    bannerAnimated,
    accentColor: user.accent_color ?? null,
    badges: resolveBadges({
      publicFlags: user.public_flags,
      premiumType: user.premium_type,
      premiumSince: user.premium_since,
    }),
    bot: Boolean(user.bot),
    system: Boolean(user.system),
    isDefaultAvatar: !user.avatar,
    nitroLikely,
    publicFlagsRaw: user.public_flags ?? 0,
    accountCreatedAt,
    accountAgeDays: Math.max(0, Math.floor((Date.now() - new Date(accountCreatedAt).getTime()) / 86_400_000)),
    flairs: computeFlairs(accountCreatedAt, avatarAnimated || bannerAnimated),
    snowflake: discordSnowflakeParts(user.id),
    firstSeenAt: timestamps.firstSeenAt,
    lastSeenAt: timestamps.lastSeenAt,
    primaryGuild,
    avatarDecorationUrl: user.avatar_decoration_data?.asset
      ? `https://cdn.discordapp.com/avatar-decoration-presets/${user.avatar_decoration_data.asset}.png?size=240`
      : null,
    avatarDecorationAsset: user.avatar_decoration_data?.asset ?? null,
    avatarDecorationSkuId: user.avatar_decoration_data?.sku_id ?? null,
    avatarDecorationExpiresAt: decorationExpiry(user.avatar_decoration_data?.expires_at),
    collectibles: user.collectibles ?? null,
    nameplate,
    nitro: {
      active: user.premium_type != null && user.premium_type > 0 ? true : user.premium_type === 0 ? false : null,
      type:
        user.premium_type === 1 ? "Nitro Classic" :
        user.premium_type === 2 ? "Nitro" :
        user.premium_type === 3 ? "Nitro Basic" : null,
      since: user.premium_since ?? null,
    },
    booster: { active: null, since: null },
  };
}

export async function fetchDiscordUser(id: string, token: string) {
  const response = await fetch(`https://discord.com/api/v10/users/${id}`, {
    headers: { Authorization: `Bot ${token}` },
    cache: "no-store",
  });

  if (response.status === 404) return { status: "not_found" as const };
  if (response.status === 429) {
    const body = (await response.json().catch(() => ({}))) as { retry_after?: number };
    return { status: "rate_limited" as const, retryAfter: body.retry_after ?? 5 };
  }
  if (response.status === 401 || response.status === 403) return { status: "unauthorized" as const };
  if (!response.ok) return { status: "error" as const };

  return { status: "ok" as const, user: (await response.json()) as DiscordApiUser };
}
