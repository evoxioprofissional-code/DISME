import "server-only";
import type { DiscordBadge, DiscordPublicUser } from "@/types/discord";

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
  avatar_decoration_data?: { asset: string; sku_id: string } | null;
  collectibles?: Record<string, unknown> | null;
  primary_guild?: {
    identity_guild_id?: string | null;
    identity_enabled?: boolean | null;
    tag?: string | null;
    badge?: string | null;
  } | null;
}

const PUBLIC_FLAG_LABELS: Array<[number, string, string]> = [
  [1 << 0, "staff", "Equipe do Discord"],
  [1 << 1, "partner", "Parceiro"],
  [1 << 2, "hypesquad", "HypeSquad Events"],
  [1 << 3, "bug_hunter_1", "Bug Hunter"],
  [1 << 6, "bravery", "HypeSquad Bravery"],
  [1 << 7, "brilliance", "HypeSquad Brilliance"],
  [1 << 8, "balance", "HypeSquad Balance"],
  [1 << 9, "early_supporter", "Early Supporter"],
  [1 << 14, "bug_hunter_2", "Bug Hunter Nível 2"],
  [1 << 16, "verified_bot", "Bot verificado"],
  [1 << 17, "verified_developer", "Desenvolvedor verificado"],
  [1 << 18, "certified_moderator", "Moderator Alumni"],
];

export function isDiscordId(value: string) {
  return /^\d{17,20}$/.test(value);
}

export function discordAccountCreatedAt(id: string) {
  const milliseconds = (BigInt(id) >> SNOWFLAKE_SHIFT) + DISCORD_EPOCH;
  return new Date(Number(milliseconds)).toISOString();
}

export function discordAvatarUrl(id: string, hash?: string | null) {
  if (hash) return `https://cdn.discordapp.com/avatars/${id}/${hash}.webp?size=512`;
  const index = Number((BigInt(id) >> SNOWFLAKE_SHIFT) % DEFAULT_AVATAR_COUNT);
  return `https://cdn.discordapp.com/embed/avatars/${index}.png`;
}

export function discordBannerUrl(id: string, hash?: string | null) {
  return hash ? `https://cdn.discordapp.com/banners/${id}/${hash}.webp?size=1024` : null;
}

export function discordBadges(flags = 0): DiscordBadge[] {
  return PUBLIC_FLAG_LABELS.filter(([value]) => (flags & value) === value).map(
    ([, key, label]) => ({ key, label }),
  );
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

  return {
    id: user.id,
    username: user.username,
    displayName: user.global_name ?? null,
    discriminator: user.discriminator && user.discriminator !== "0" ? user.discriminator : null,
    avatarUrl: discordAvatarUrl(user.id, user.avatar),
    bannerUrl: discordBannerUrl(user.id, user.banner),
    accentColor: user.accent_color ?? null,
    badges: discordBadges(user.public_flags),
    bot: Boolean(user.bot),
    system: Boolean(user.system),
    accountCreatedAt: discordAccountCreatedAt(user.id),
    firstSeenAt: timestamps.firstSeenAt,
    lastSeenAt: timestamps.lastSeenAt,
    primaryGuild,
    avatarDecorationUrl: user.avatar_decoration_data?.asset
      ? `https://cdn.discordapp.com/avatar-decoration-presets/${user.avatar_decoration_data.asset}.png?size=240`
      : null,
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
