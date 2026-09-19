import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  discordAvatarUrl,
  discordAccountCreatedAt,
  discordBannerUrl,
  fetchDiscordUser,
  isDiscordId,
  normalizeDiscordUser,
  type DiscordApiUser,
} from "@/lib/discord";
import type { DiscordIdentityVersion, DiscordLookupResult } from "@/types/discord";

export const runtime = "nodejs";

const CACHE_TTL_MS = 15 * 60 * 1000;
const MINUTE_LIMIT = 5;
const HOUR_LIMIT = 30;

type DiscordUserRow = {
  discord_user_id: string;
  username: string;
  global_name: string | null;
  discriminator: string | null;
  avatar_hash: string | null;
  banner_hash: string | null;
  accent_color: number | null;
  public_flags: number | string;
  is_bot: boolean;
  is_system: boolean;
  avatar_decoration: DiscordApiUser["avatar_decoration_data"];
  collectibles: DiscordApiUser["collectibles"];
  primary_guild: DiscordApiUser["primary_guild"];
  discord_created_at: string;
  first_seen_at: string;
  last_seen_at: string;
  updated_at: string;
};

function apiUserFromRow(row: DiscordUserRow): DiscordApiUser {
  return {
    id: row.discord_user_id,
    username: row.username,
    global_name: row.global_name,
    discriminator: row.discriminator ?? undefined,
    avatar: row.avatar_hash,
    banner: row.banner_hash,
    accent_color: row.accent_color,
    public_flags: Number(row.public_flags),
    bot: row.is_bot,
    system: row.is_system,
    avatar_decoration_data: row.avatar_decoration,
    collectibles: row.collectibles,
    primary_guild: row.primary_guild,
  };
}

function mapHistory(
  discordUserId: string,
  rows: Array<{
    id: number;
    username: string;
    global_name: string | null;
    avatar_hash: string | null;
    banner_hash: string | null;
    first_seen: boolean;
    observed_at: string;
  }>,
): DiscordIdentityVersion[] {
  return rows.map((row) => ({
    id: row.id,
    username: row.username,
    displayName: row.global_name,
    avatarUrl: discordAvatarUrl(discordUserId, row.avatar_hash),
    bannerUrl: discordBannerUrl(discordUserId, row.banner_hash),
    observedAt: row.observed_at,
    firstSeen: row.first_seen,
  }));
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user: requester },
  } = await supabase.auth.getUser();

  if (!requester) {
    return NextResponse.json({ error: "Entre no DisMe para fazer consultas." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { id?: unknown } | null;
  const discordUserId = typeof body?.id === "string" ? body.id.trim() : "";
  if (!isDiscordId(discordUserId)) {
    return NextResponse.json(
      { error: "Digite um ID do Discord válido, com 17 a 20 números." },
      { status: 400 },
    );
  }

  let admin: ReturnType<typeof createAdminClient>;
  try {
    admin = createAdminClient();
  } catch {
    return NextResponse.json({ error: "A consulta ainda não foi configurada no servidor." }, { status: 503 });
  }

  const now = Date.now();
  const minuteAgo = new Date(now - 60_000).toISOString();
  const hourAgo = new Date(now - 3_600_000).toISOString();
  const [minuteCount, hourCount, cachedQuery] = await Promise.all([
    admin
      .from("discord_lookup_events")
      .select("id", { count: "exact", head: true })
      .eq("requester_profile_id", requester.id)
      .gte("created_at", minuteAgo),
    admin
      .from("discord_lookup_events")
      .select("id", { count: "exact", head: true })
      .eq("requester_profile_id", requester.id)
      .gte("created_at", hourAgo),
    admin.from("discord_users").select("*").eq("discord_user_id", discordUserId).maybeSingle(),
  ]);

  if ((minuteCount.count ?? 0) >= MINUTE_LIMIT || (hourCount.count ?? 0) >= HOUR_LIMIT) {
    await admin.from("discord_lookup_events").insert({
      requester_profile_id: requester.id,
      target_discord_id: discordUserId,
      result_status: "rate_limited",
    });
    return NextResponse.json(
      { error: "Muitas consultas em pouco tempo. Aguarde alguns minutos e tente novamente." },
      { status: 429, headers: { "Retry-After": "60" } },
    );
  }

  const cached = cachedQuery.data as DiscordUserRow | null;
  const cacheIsFresh = cached && now - new Date(cached.updated_at).getTime() < CACHE_TTL_MS;

  const recordEvent = (status: "fresh" | "cached" | "not_found" | "rate_limited" | "error") =>
    admin.from("discord_lookup_events").insert({
      requester_profile_id: requester.id,
      target_discord_id: discordUserId,
      result_status: status,
    });

  if (cached && cacheIsFresh) {
    const { data: historyRows } = await admin
      .from("discord_identity_history")
      .select("id,username,global_name,avatar_hash,banner_hash,first_seen,observed_at")
      .eq("discord_user_id", discordUserId)
      .order("observed_at", { ascending: false })
      .limit(30);
    await recordEvent("cached");
    const result: DiscordLookupResult = {
      user: normalizeDiscordUser(apiUserFromRow(cached), {
        firstSeenAt: cached.first_seen_at,
        lastSeenAt: cached.last_seen_at,
      }),
      history: mapHistory(discordUserId, historyRows ?? []),
      cached: true,
    };
    return NextResponse.json(result);
  }

  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "O token do bot ainda não está configurado." }, { status: 503 });
  }

  const discord = await fetchDiscordUser(discordUserId, token);
  if (discord.status === "not_found") {
    await recordEvent("not_found");
    return NextResponse.json({ error: "Nenhum usuário foi encontrado com esse ID." }, { status: 404 });
  }
  if (discord.status === "rate_limited") {
    await recordEvent("rate_limited");
    return NextResponse.json(
      { error: "O Discord limitou temporariamente as consultas. Tente novamente em instantes." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(discord.retryAfter)) } },
    );
  }
  if (discord.status === "unauthorized") {
    await recordEvent("error");
    return NextResponse.json(
      { error: "O bot do DisMe não conseguiu se autenticar no Discord." },
      { status: 502 },
    );
  }
  if (discord.status !== "ok") {
    await recordEvent("error");
    return NextResponse.json({ error: "O Discord não respondeu à consulta." }, { status: 502 });
  }

  const fetchedAt = new Date().toISOString();
  const firstSeenAt = cached?.first_seen_at ?? fetchedAt;
  const identityChanged =
    !cached ||
    cached.username !== discord.user.username ||
    cached.global_name !== (discord.user.global_name ?? null) ||
    cached.avatar_hash !== (discord.user.avatar ?? null) ||
    cached.banner_hash !== (discord.user.banner ?? null);

  const { error: saveError } = await admin.from("discord_users").upsert({
    discord_user_id: discord.user.id,
    username: discord.user.username,
    global_name: discord.user.global_name ?? null,
    discriminator: discord.user.discriminator ?? null,
    avatar_hash: discord.user.avatar ?? null,
    banner_hash: discord.user.banner ?? null,
    accent_color: discord.user.accent_color ?? null,
    public_flags: discord.user.public_flags ?? 0,
    is_bot: Boolean(discord.user.bot),
    is_system: Boolean(discord.user.system),
    avatar_decoration: discord.user.avatar_decoration_data ?? null,
    collectibles: discord.user.collectibles ?? null,
    primary_guild: discord.user.primary_guild ?? null,
    discord_created_at: discordAccountCreatedAt(discord.user.id),
    first_seen_at: firstSeenAt,
    last_seen_at: fetchedAt,
    updated_at: fetchedAt,
  });

  if (saveError) {
    await recordEvent("error");
    return NextResponse.json({ error: "Não foi possível salvar o resultado da consulta." }, { status: 500 });
  }

  if (identityChanged) {
    await admin.from("discord_identity_history").insert({
      discord_user_id: discord.user.id,
      username: discord.user.username,
      global_name: discord.user.global_name ?? null,
      avatar_hash: discord.user.avatar ?? null,
      banner_hash: discord.user.banner ?? null,
      first_seen: !cached,
      observed_at: fetchedAt,
    });
  }

  const { data: historyRows } = await admin
    .from("discord_identity_history")
    .select("id,username,global_name,avatar_hash,banner_hash,first_seen,observed_at")
    .eq("discord_user_id", discordUserId)
    .order("observed_at", { ascending: false })
    .limit(30);
  await recordEvent("fresh");

  const result: DiscordLookupResult = {
    user: normalizeDiscordUser(discord.user, { firstSeenAt, lastSeenAt: fetchedAt }),
    history: mapHistory(discordUserId, historyRows ?? []),
    cached: false,
  };
  return NextResponse.json(result);
}
