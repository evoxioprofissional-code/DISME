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
import { fetchNameDcProvider, nameDcAvatarUrl, nameDcBannerUrl } from "@/lib/namedc";
import { archiveDiscordImage } from "@/lib/discord-archive";
import { fetchOathNetHistory } from "@/lib/providers/oathnet";
import type { HistoryObservation } from "@/lib/providers/types";
import { saveDisMeObservations } from "@/lib/providers/disme";
import type { DiscordIdentityVersion, DiscordLookupResult } from "@/types/discord";

export const runtime = "nodejs";

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
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
  premium_type: number | null;
  premium_since: string | null;
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
    premium_type: row.premium_type,
    premium_since: row.premium_since,
  };
}

function mapNameDcHistory(
  discordUserId: string,
  rows: Array<{
    id: number;
    username: string | null;
    display_name: string | null;
    avatar_hash: string | null;
    banner_hash: string | null;
    observed_at: string;
  }>,
): DiscordIdentityVersion[] {
  return rows.map((row) => ({
    id: -row.id,
    username: row.username,
    displayName: row.display_name,
    avatarUrl: nameDcAvatarUrl(discordUserId, row.avatar_hash),
    bannerUrl: nameDcBannerUrl(discordUserId, row.banner_hash),
    observedAt: row.observed_at,
    firstSeen: false,
    source: "namedc",
  }));
}

type ObservationRow = {
  id: number;
  field: HistoryObservation["field"];
  value: string;
  asset_url: string | null;
  asset_hash: string | null;
  first_seen_at: string;
  observed_at: string;
  source: HistoryObservation["source"];
};

function mapObservationHistory(rows: ObservationRow[]): DiscordIdentityVersion[] {
  const grouped = new Map<string, DiscordIdentityVersion>();
  for (const row of rows) {
    const key = `${row.observed_at}|${row.source}`;
    const current = grouped.get(key) ?? {
      id: -row.id,
      username: null,
      displayName: null,
      avatarUrl: null,
      bannerUrl: null,
      observedAt: row.observed_at,
      firstSeen: row.first_seen_at === row.observed_at,
      source: row.source,
    };
    if (row.field === "username") current.username = row.value;
    if (row.field === "display_name") current.displayName = row.value;
    if (row.field === "avatar") current.avatarUrl = row.asset_url;
    if (row.field === "banner") current.bannerUrl = row.asset_url;
    grouped.set(key, current);
  }
  return [...grouped.values()];
}

function mergeHistory(...groups: DiscordIdentityVersion[][]) {
  const merged = new Map<string, DiscordIdentityVersion>();
  for (const group of groups.flat()) {
    const key = [group.observedAt, group.username ?? "", group.displayName ?? "", group.avatarUrl ?? "", group.bannerUrl ?? ""].join("|");
    if (!merged.has(key)) merged.set(key, group);
  }
  return [...merged.values()].sort((left, right) => right.observedAt.localeCompare(left.observedAt));
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
  const [minuteCount, hourCount, cachedQuery, externalHistoryQuery] = await Promise.all([
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
    admin
      .from("external_discord_history")
      .select("id,username,display_name,avatar_hash,banner_hash,observed_at")
      .eq("discord_user_id", discordUserId)
      .order("observed_at", { ascending: false })
      .limit(100),
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
    const { data: observationRows } = await admin
      .from("discord_history_observations")
      .select("id,field,value,asset_url,asset_hash,first_seen_at,observed_at,source")
      .eq("discord_user_id", discordUserId)
      .order("observed_at", { ascending: false });
    await recordEvent("cached");
    const result: DiscordLookupResult = {
      user: normalizeDiscordUser(apiUserFromRow(cached), {
        firstSeenAt: cached.first_seen_at,
        lastSeenAt: cached.last_seen_at,
      }),
      history: mergeHistory(
        mapNameDcHistory(discordUserId, externalHistoryQuery.data ?? []),
        mapObservationHistory((observationRows ?? []) as ObservationRow[]),
      ),
      cached: true,
      providers: {
        discord: { status: "cached", configured: true },
        clarion: { status: "unavailable", configured: false },
        discordSensor: { status: "unavailable", configured: false },
        oathnet: { status: "cached", configured: Boolean(process.env.OATHNET_API_KEY) },
        namedc: { status: "cached", configured: Boolean(process.env.NAMEDC_API_TOKEN) },
        disme: { status: "cached", configured: true },
      },
    };
    return NextResponse.json(result);
  }

  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "O token do bot ainda não está configurado." }, { status: 503 });
  }

  const [discord, namedc, oathnet] = await Promise.all([
    fetchDiscordUser(discordUserId, token),
    fetchNameDcProvider(discordUserId, process.env.NAMEDC_API_TOKEN),
    fetchOathNetHistory(discordUserId, process.env.OATHNET_API_KEY),
  ]);
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
    premium_type: discord.user.premium_type ?? null,
    premium_since: discord.user.premium_since ?? null,
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

  // Archive current avatar/banner so old images keep rendering after Discord purges them.
  const archivedAvatarUrl = discord.user.avatar
    ? await archiveDiscordImage(admin, discordUserId, "avatar", discord.user.avatar, discordAvatarUrl(discordUserId, discord.user.avatar))
    : null;
  const archivedBannerUrl = discord.user.banner
    ? await archiveDiscordImage(admin, discordUserId, "banner", discord.user.banner, discordBannerUrl(discordUserId, discord.user.banner)!)
    : null;

  const currentObservations: HistoryObservation[] = [
    { field: "username", value: discord.user.username, assetUrl: null, assetHash: discord.user.username, observedAt: fetchedAt, source: "disme" },
    ...(discord.user.global_name ? [{ field: "display_name" as const, value: discord.user.global_name, assetUrl: null, assetHash: discord.user.global_name, observedAt: fetchedAt, source: "disme" as const }] : []),
    ...(discord.user.avatar ? [{ field: "avatar" as const, value: discord.user.avatar, assetUrl: archivedAvatarUrl, assetHash: discord.user.avatar, observedAt: fetchedAt, source: "disme" as const }] : []),
    ...(discord.user.banner ? [{ field: "banner" as const, value: discord.user.banner, assetUrl: archivedBannerUrl, assetHash: discord.user.banner, observedAt: fetchedAt, source: "disme" as const }] : []),
  ];
  await saveDisMeObservations(admin, discordUserId, [
    ...currentObservations,
    ...namedc.observations,
    ...oathnet.observations,
  ]);

  const [{ data: externalHistoryRows }, { data: observationRows }] = await Promise.all([
    admin
      .from("external_discord_history")
      .select("id,username,display_name,avatar_hash,banner_hash,observed_at")
      .eq("discord_user_id", discordUserId)
      .order("observed_at", { ascending: false })
      .limit(100),
    admin
      .from("discord_history_observations")
      .select("id,field,value,asset_url,asset_hash,first_seen_at,observed_at,source")
      .eq("discord_user_id", discordUserId)
      .order("observed_at", { ascending: false }),
  ]);
  await recordEvent("fresh");

  const result: DiscordLookupResult = {
    user: normalizeDiscordUser(discord.user, { firstSeenAt, lastSeenAt: fetchedAt }),
    history: mergeHistory(
      mapNameDcHistory(discordUserId, externalHistoryRows ?? []),
      mapObservationHistory((observationRows ?? []) as ObservationRow[]),
    ),
    cached: false,
    providers: {
      discord: { status: "success", configured: true },
      clarion: { status: "unavailable", configured: false },
      discordSensor: { status: "unavailable", configured: false },
      oathnet: { status: oathnet.status, configured: Boolean(process.env.OATHNET_API_KEY) },
      namedc: { status: namedc.status, configured: Boolean(process.env.NAMEDC_API_TOKEN) },
      disme: { status: "success", configured: true },
    },
  };
  return NextResponse.json(result);
}
