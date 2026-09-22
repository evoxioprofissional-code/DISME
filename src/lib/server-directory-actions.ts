"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fetchDiscordGuild } from "@/lib/discord-guild";
import type { DiscordGuildSnapshot } from "@/types/discord-server";

export interface DiscordServerFormState { error?: string; inviteUrl?: string }

function text(form: FormData, key: string, max: number) { return String(form.get(key) ?? "").trim().slice(0, max); }
function validInvite(value: string) {
  if (!value) return null;
  try {
    const url = new URL(value.startsWith("http") ? value : `https://${value}`);
    if (!["discord.gg", "discord.com", "www.discord.com"].includes(url.hostname)) return null;
    if (url.hostname !== "discord.gg" && !url.pathname.startsWith("/invite/")) return null;
    return url.toString().slice(0, 200);
  } catch { return null; }
}

async function sessionContext() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, discordId: null };
  const { data: connection } = await supabase.from("connections").select("detail").eq("profile_id", user.id).eq("platform", "discord").maybeSingle();
  const discordId = connection?.detail && /^\d{17,20}$/.test(connection.detail) ? connection.detail : null;
  return { supabase, user, discordId };
}

function imported(guild: DiscordGuildSnapshot) {
  return {
    discord_owner_id: guild.ownerId,
    name: guild.name,
    discord_description: guild.description ?? null,
    icon_url: guild.iconUrl ?? null,
    banner_url: guild.bannerUrl ?? null,
    splash_url: guild.splashUrl ?? null,
    member_count: guild.memberCount,
    online_count: guild.onlineCount,
    boost_count: guild.boostCount,
    boost_tier: guild.boostTier,
    verification_level: guild.verificationLevel,
    preferred_locale: guild.preferredLocale ?? null,
    channel_count: guild.channelCount,
    role_count: guild.roleCount,
    emoji_count: guild.emojiCount,
    features: guild.features,
    synced_at: new Date().toISOString(),
  };
}

export async function saveDiscordServer(_previous: DiscordServerFormState, form: FormData): Promise<DiscordServerFormState> {
  const { supabase, user, discordId } = await sessionContext();
  if (!user) return { error: "Entre com sua conta para anunciar um servidor." };
  if (!discordId) return { error: "Entre novamente usando o Discord para confirmar sua identidade." };
  const guildId = text(form, "guild_id", 20);
  if (!/^\d{17,20}$/.test(guildId)) return { error: "Informe um ID de servidor válido." };
  const result = await fetchDiscordGuild(guildId);
  if (result.status === "bot_missing") return { error: "Adicione o bot DisMe ao servidor e tente novamente.", inviteUrl: result.inviteUrl };
  if (result.status === "unauthorized") return { error: "O bot DisMe ainda não está configurado corretamente." };
  if (result.status !== "ok") return { error: "O Discord não respondeu à consulta do servidor." };
  if (result.guild.ownerId !== discordId) return { error: "Somente o dono do servidor pode criar este anúncio." };
  const inviteRaw = text(form, "invite_url", 200);
  const inviteUrl = validInvite(inviteRaw);
  if (inviteRaw && !inviteUrl) return { error: "Use um convite oficial discord.gg ou discord.com/invite." };
  const tags = Array.from(new Set(text(form, "tags", 240).split(",").map((tag) => tag.trim()).filter(Boolean))).slice(0, 8);
  const promoText = text(form, "promo_text", 700);
  const isPublished = form.get("is_published") === "on";
  const { data: existing } = await supabase.from("discord_server_listings").select("id,owner_profile_id").eq("discord_guild_id", guildId).maybeSingle();
  if (existing && existing.owner_profile_id !== user.id) return { error: "Este servidor já foi anunciado por outro perfil." };
  const payload = { owner_profile_id: user.id, discord_guild_id: guildId, ...imported(result.guild), promo_text: promoText, invite_url: inviteUrl, tags, is_published: isPublished };
  const operation = existing
    ? supabase.from("discord_server_listings").update(payload).eq("id", existing.id).eq("owner_profile_id", user.id).select("id").single()
    : supabase.from("discord_server_listings").insert(payload).select("id").single();
  const { data, error } = await operation;
  if (error || !data) return { error: "Não foi possível salvar o anúncio do servidor." };
  revalidatePath("/marketplace"); revalidatePath("/servers/manage"); revalidatePath(`/server/${data.id}`);
  redirect(`/server/${data.id}`);
}

export async function refreshDiscordServer(form: FormData) {
  const { supabase, user, discordId } = await sessionContext();
  if (!user || !discordId) redirect("/login");
  const id = text(form, "listing_id", 60);
  const { data: listing } = await supabase.from("discord_server_listings").select("discord_guild_id").eq("id", id).eq("owner_profile_id", user.id).maybeSingle();
  if (!listing) return;
  const result = await fetchDiscordGuild(listing.discord_guild_id);
  if (result.status !== "ok" || result.guild.ownerId !== discordId) return;
  await supabase.from("discord_server_listings").update(imported(result.guild)).eq("id", id).eq("owner_profile_id", user.id);
  revalidatePath("/marketplace"); revalidatePath("/servers/manage"); revalidatePath(`/server/${id}`);
}

export async function setDiscordServerPublished(form: FormData) {
  const { supabase, user } = await sessionContext();
  if (!user) redirect("/login");
  const id = text(form, "listing_id", 60);
  await supabase.from("discord_server_listings").update({ is_published: form.get("published") === "true" }).eq("id", id).eq("owner_profile_id", user.id);
  revalidatePath("/marketplace"); revalidatePath("/servers/manage");
}

export async function deleteDiscordServer(form: FormData) {
  const { supabase, user } = await sessionContext();
  if (!user) redirect("/login");
  await supabase.from("discord_server_listings").delete().eq("id", text(form, "listing_id", 60)).eq("owner_profile_id", user.id);
  revalidatePath("/marketplace"); revalidatePath("/servers/manage"); redirect("/servers/manage");
}
