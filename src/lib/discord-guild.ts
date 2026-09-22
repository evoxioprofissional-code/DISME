import "server-only";
import type { DiscordGuildSnapshot } from "@/types/discord-server";

type GuildResponse = {
  id: string;
  owner_id: string;
  name: string;
  description?: string | null;
  icon?: string | null;
  banner?: string | null;
  splash?: string | null;
  approximate_member_count?: number;
  approximate_presence_count?: number;
  premium_subscription_count?: number;
  premium_tier?: number;
  verification_level?: number;
  preferred_locale?: string;
  roles?: unknown[];
  emojis?: unknown[];
  features?: string[];
};

export type GuildFetchResult =
  | { status: "ok"; guild: DiscordGuildSnapshot }
  | { status: "bot_missing"; inviteUrl?: string }
  | { status: "unauthorized" }
  | { status: "error" };

function asset(path: string, id: string, hash?: string | null) {
  if (!hash) return undefined;
  const extension = hash.startsWith("a_") ? "gif" : "webp";
  return `https://cdn.discordapp.com/${path}/${id}/${hash}.${extension}?size=1024`;
}

async function botInvite(token: string, guildId: string) {
  const configured = process.env.DISCORD_CLIENT_ID;
  let clientId = configured;
  if (!clientId) {
    const response = await fetch("https://discord.com/api/v10/users/@me", {
      headers: { Authorization: `Bot ${token}` }, cache: "no-store",
    });
    if (response.ok) clientId = ((await response.json()) as { id?: string }).id;
  }
  if (!clientId) return undefined;
  const params = new URLSearchParams({ client_id: clientId, scope: "bot applications.commands", permissions: "0", guild_id: guildId, disable_guild_select: "true" });
  return `https://discord.com/oauth2/authorize?${params.toString()}`;
}

export async function fetchDiscordGuild(guildId: string): Promise<GuildFetchResult> {
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) return { status: "unauthorized" };
  try {
    const response = await fetch(`https://discord.com/api/v10/guilds/${guildId}?with_counts=true`, {
      headers: { Authorization: `Bot ${token}` }, cache: "no-store", signal: AbortSignal.timeout(8000),
    });
    if (response.status === 401) return { status: "unauthorized" };
    if (response.status === 403 || response.status === 404) return { status: "bot_missing", inviteUrl: await botInvite(token, guildId) };
    if (!response.ok) return { status: "error" };
    const guild = await response.json() as GuildResponse;
    const channelsResponse = await fetch(`https://discord.com/api/v10/guilds/${guildId}/channels`, {
      headers: { Authorization: `Bot ${token}` }, cache: "no-store", signal: AbortSignal.timeout(8000),
    });
    const channels = channelsResponse.ok ? await channelsResponse.json() as unknown[] : [];
    return {
      status: "ok",
      guild: {
        guildId: guild.id,
        ownerId: guild.owner_id,
        name: guild.name,
        description: guild.description ?? undefined,
        iconUrl: asset("icons", guild.id, guild.icon),
        bannerUrl: asset("banners", guild.id, guild.banner),
        splashUrl: asset("splashes", guild.id, guild.splash),
        memberCount: guild.approximate_member_count ?? 0,
        onlineCount: guild.approximate_presence_count ?? 0,
        boostCount: guild.premium_subscription_count ?? 0,
        boostTier: guild.premium_tier ?? 0,
        verificationLevel: guild.verification_level ?? 0,
        preferredLocale: guild.preferred_locale,
        channelCount: channels.length,
        roleCount: guild.roles?.length ?? 0,
        emojiCount: guild.emojis?.length ?? 0,
        features: guild.features ?? [],
      },
    };
  } catch {
    return { status: "error" };
  }
}
