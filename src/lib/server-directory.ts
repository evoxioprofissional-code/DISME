import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { DiscordServerListing } from "@/types/discord-server";

/* eslint-disable @typescript-eslint/no-explicit-any */

const SELECT = `*,owner:profiles!discord_server_listings_owner_profile_id_fkey(id,username,display_name,avatar_url,connections(platform,handle,detail))`;

function mapServer(row: any): DiscordServerListing {
  const discord = (row.owner?.connections ?? []).find((item: any) => item.platform === "discord");
  return {
    id: row.id,
    ownerProfileId: row.owner_profile_id,
    guildId: row.discord_guild_id,
    discordOwnerId: row.discord_owner_id,
    name: row.name,
    discordDescription: row.discord_description ?? undefined,
    promoText: row.promo_text ?? "",
    iconUrl: row.icon_url ?? undefined,
    bannerUrl: row.banner_url ?? undefined,
    splashUrl: row.splash_url ?? undefined,
    inviteUrl: row.invite_url ?? undefined,
    memberCount: row.member_count ?? 0,
    onlineCount: row.online_count ?? 0,
    boostCount: row.boost_count ?? 0,
    boostTier: row.boost_tier ?? 0,
    verificationLevel: row.verification_level ?? 0,
    preferredLocale: row.preferred_locale ?? undefined,
    channelCount: row.channel_count ?? 0,
    roleCount: row.role_count ?? 0,
    emojiCount: row.emoji_count ?? 0,
    features: row.features ?? [],
    tags: row.tags ?? [],
    isPublished: row.is_published,
    syncedAt: row.synced_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    owner: {
      id: row.owner.id,
      username: row.owner.username,
      displayName: row.owner.display_name,
      avatar: row.owner.avatar_url ?? "",
      discordHandle: discord?.handle ?? undefined,
      discordId: discord?.detail && /^\d{17,20}$/.test(discord.detail) ? discord.detail : undefined,
    },
  };
}

export async function listDiscordServers(search?: string): Promise<DiscordServerListing[]> {
  const supabase = await createClient();
  let query = supabase.from("discord_server_listings").select(SELECT).eq("is_published", true).order("member_count", { ascending: false }).limit(60);
  const clean = search?.trim().replace(/[%_]/g, "").slice(0, 60);
  if (clean) query = query.ilike("name", `%${clean}%`);
  const { data } = await query;
  return (data ?? []).map(mapServer);
}

export async function getDiscordServer(id: string): Promise<DiscordServerListing | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("discord_server_listings").select(SELECT).eq("id", id).maybeSingle();
  return data ? mapServer(data) : null;
}

export async function listMyDiscordServers(): Promise<DiscordServerListing[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase.from("discord_server_listings").select(SELECT).eq("owner_profile_id", user.id).order("updated_at", { ascending: false });
  return (data ?? []).map(mapServer);
}

export async function listDiscordServersByOwner(ownerId: string): Promise<DiscordServerListing[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("discord_server_listings").select(SELECT).eq("owner_profile_id", ownerId).order("member_count", { ascending: false });
  return (data ?? []).map(mapServer);
}
