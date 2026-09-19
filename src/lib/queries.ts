import "server-only";
import type {
  User,
  Badge,
  SocialConnection,
  FeedActivity,
  Gift,
  Couple,
  RankingCategory,
  RankingEntry,
} from "@/types";
import { createClient } from "@/lib/supabase/server";
import { getGift } from "@/data/gifts";

/* eslint-disable @typescript-eslint/no-explicit-any */

// -------- mappers --------
export function mapProfile(r: any): User {
  return {
    id: r.id,
    username: r.username,
    displayName: r.display_name,
    age: r.age ?? 0,
    pronouns: r.pronouns ?? undefined,
    location: r.location ?? undefined,
    bio: r.bio ?? "",
    avatar: r.avatar_url ?? "",
    banner: r.banner_url ?? undefined,
    presence: r.presence ?? "offline",
    gender: r.gender ?? "outro",
    intent: r.intent ?? "conversar",
    relationship: r.relationship ?? "solteiro",
    partnerId: r.partner_id ?? undefined,
    games: r.games ?? [],
    interests: r.interests ?? [],
    badges: (r.badges ?? []).map(mapBadge),
    connections: (r.connections ?? []).map(mapConnection),
    stats: {
      flex: r.flex ?? 0,
      giftsReceived: r.gifts_received ?? 0,
      giftsSent: r.gifts_sent ?? 0,
      matches: r.matches_count ?? 0,
      followers: r.followers_count ?? 0,
      collectionCount: r.collection_count ?? 0,
    },
    flexRank: r.flex_rank ?? undefined,
  };
}
const mapBadge = (b: any): Badge => ({ id: b.id, label: b.label, icon: b.icon, rarity: b.rarity ?? undefined });
const mapConnection = (c: any): SocialConnection => ({
  platform: c.platform,
  handle: c.handle,
  detail: c.detail ?? undefined,
});

const PROFILE_COLS =
  "id,username,display_name,age,pronouns,location,bio,avatar_url,banner_url,presence,gender,intent,relationship,partner_id,games,interests,flex,gifts_received,gifts_sent,matches_count,followers_count,collection_count";

// -------- session / me --------
export async function getSessionUserId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export async function getMyProfile(): Promise<User | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("profiles")
    .select(`${PROFILE_COLS}, badges(*), connections(*)`)
    .eq("id", user.id)
    .maybeSingle();
  if (!data) return null;
  const me = mapProfile(data);
  me.flexRank = await flexRankOf(user.id);
  return me;
}

export async function getMyCredits(): Promise<number> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;
  const { data } = await supabase.from("profiles").select("credits").eq("id", user.id).maybeSingle();
  return data?.credits ?? 0;
}

export async function isOnboarded(): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;
  const { data } = await supabase.from("profiles").select("onboarded").eq("id", user.id).maybeSingle();
  return !!data?.onboarded;
}

async function flexRankOf(id: string): Promise<number | undefined> {
  const supabase = await createClient();
  const { data } = await supabase.from("flex_ranking").select("position").eq("id", id).maybeSingle();
  return data?.position ?? undefined;
}

export interface ShellData {
  me: User | null;
  unreadMessages: number;
  unreadNotifs: number;
  newMatches: number;
}

export async function getShellData(): Promise<ShellData> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { me: null, unreadMessages: 0, unreadNotifs: 0, newMatches: 0 };

  const { data: profile } = await supabase
    .from("profiles")
    .select(PROFILE_COLS)
    .eq("id", user.id)
    .maybeSingle();

  const [{ count: unreadNotifs }, { count: unreadMessages }] = await Promise.all([
    supabase.from("notifications").select("*", { count: "exact", head: true }).eq("read", false),
    supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .eq("read", false)
      .neq("sender_id", user.id),
  ]);

  return {
    me: profile ? mapProfile(profile) : null,
    unreadMessages: unreadMessages ?? 0,
    unreadNotifs: unreadNotifs ?? 0,
    newMatches: 0,
  };
}

// -------- profiles --------
export async function getProfileByUsername(username: string): Promise<User | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select(`${PROFILE_COLS}, badges(*), connections(*)`)
    .eq("username", username)
    .maybeSingle();
  if (!data) return null;
  const u = mapProfile(data);
  u.flexRank = await flexRankOf(u.id);
  return u;
}

export async function listDiscover(meId: string): Promise<User[]> {
  const supabase = await createClient();
  const { data: liked } = await supabase.from("likes").select("to_id").eq("from_id", meId);
  const excluded = new Set<string>([meId, ...(liked ?? []).map((l: any) => l.to_id)]);
  const { data } = await supabase
    .from("profiles")
    .select(PROFILE_COLS)
    .eq("is_hidden", false)
    .eq("onboarded", true)
    .limit(50);
  return (data ?? []).map(mapProfile).filter((u) => !excluded.has(u.id));
}

export async function listSuggestions(meId: string, limit = 5): Promise<User[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select(PROFILE_COLS)
    .eq("is_hidden", false)
    .eq("onboarded", true)
    .neq("id", meId)
    .order("flex", { ascending: false })
    .limit(limit);
  return (data ?? []).map(mapProfile);
}

export async function listGiftCatalog(): Promise<Gift[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("gifts").select("*").order("price", { ascending: true });
  return (data ?? []).map((row: any) => ({
    id: row.id,
    name: row.name,
    rarity: row.rarity,
    price: row.price,
    category: row.category,
    supply: row.supply ?? undefined,
    minted: row.minted,
    description: row.description,
    flexValue: row.flex_value,
  }));
}

// -------- feed --------
export interface FeedItemData {
  activity: FeedActivity;
  actors: User[];
  gift?: Gift;
}
export async function listFeed(limit = 20): Promise<FeedItemData[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("feed_activities")
    .select("id,owner_id,gift_id,from_id,serial,received_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  const rows = data ?? [];
  const ids = Array.from(new Set(rows.flatMap((r: any) => r.actors as string[])));
  const profiles = await profilesByIds(ids);
  return rows.map((r: any) => ({
    activity: {
      id: r.id,
      type: r.type,
      actors: r.actors,
      createdAt: r.created_at,
      giftId: r.gift_id ?? undefined,
      meta: r.meta ?? undefined,
    },
    actors: (r.actors as string[]).map((id) => profiles.get(id)).filter(Boolean) as User[],
    gift: r.gift_id ? getGift(r.gift_id) : undefined,
  }));
}

async function profilesByIds(ids: string[]): Promise<Map<string, User>> {
  if (ids.length === 0) return new Map();
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select(PROFILE_COLS).in("id", ids);
  return new Map((data ?? []).map((r: any) => [r.id, mapProfile(r)]));
}

// -------- rankings --------
export async function getRankings(): Promise<
  Record<RankingCategory, { entry: RankingEntry; user?: User; couple?: CoupleLite }[]>
> {
  const supabase = await createClient();
  const board = async (col: string) => {
    const { data } = await supabase
      .from("profiles")
      .select(PROFILE_COLS)
      .eq("is_hidden", false)
      .order(col, { ascending: false })
      .limit(20);
    return (data ?? []).map((r: any, i: number) => ({
      entry: { rank: i + 1, userId: r.id, value: r[col] ?? 0 } as RankingEntry,
      user: mapProfile(r),
    }));
  };
  const couplesBoard = async (col: "streak_days" | "gifts_exchanged") => {
    const couples = await listCouples();
    return couples
      .sort((a, b) => (b.couple as any)[col === "streak_days" ? "streakDays" : "giftsExchanged"] - (a.couple as any)[col === "streak_days" ? "streakDays" : "giftsExchanged"])
      .map((c, i) => ({
        entry: {
          rank: i + 1,
          coupleId: c.couple.id,
          value: col === "streak_days" ? c.couple.streakDays : c.couple.giftsExchanged,
        } as RankingEntry,
        couple: { id: c.couple.id, a: c.a, b: c.b } as CoupleLite,
      }));
  };
  const [flex, presenteados, colecionadores, casais, streaks] = await Promise.all([
    board("flex"),
    board("gifts_received"),
    board("collection_count"),
    couplesBoard("gifts_exchanged"),
    couplesBoard("streak_days"),
  ]);
  return { flex, presenteados, colecionadores, casais, streaks };
}

export interface CoupleLite {
  id: string;
  a: User;
  b: User;
}

// -------- matches / messages --------
export interface MatchData {
  id: string;
  user: User;
  matchedAt: string;
  viaCrush: boolean;
}
export async function listMatches(meId: string): Promise<MatchData[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("matches")
    .select("*")
    .or(`user_a.eq.${meId},user_b.eq.${meId}`)
    .order("created_at", { ascending: false });
  const rows = data ?? [];
  const otherIds = rows.map((r: any) => (r.user_a === meId ? r.user_b : r.user_a));
  const profiles = await profilesByIds(otherIds);
  return rows
    .map((r: any) => {
      const otherId = r.user_a === meId ? r.user_b : r.user_a;
      const user = profiles.get(otherId);
      if (!user) return null;
      return { id: r.id, user, matchedAt: r.created_at, viaCrush: r.via_crush };
    })
    .filter(Boolean) as MatchData[];
}

export interface ConversationData {
  id: string;
  other: User;
  lastBody?: string;
  lastGiftId?: string;
  lastSenderId?: string;
  updatedAt: string;
  unread: number;
}
export async function listConversations(meId: string): Promise<ConversationData[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("conversations")
    .select("*, messages(id,body,gift_id,sender_id,read,created_at)")
    .or(`user_a.eq.${meId},user_b.eq.${meId}`)
    .order("updated_at", { ascending: false });
  const rows = data ?? [];
  const otherIds = rows.map((r: any) => (r.user_a === meId ? r.user_b : r.user_a));
  const profiles = await profilesByIds(otherIds);
  return rows
    .map((r: any) => {
      const otherId = r.user_a === meId ? r.user_b : r.user_a;
      const other = profiles.get(otherId);
      if (!other) return null;
      const msgs = (r.messages ?? []).sort(
        (a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      );
      const last = msgs[msgs.length - 1];
      const unread = msgs.filter((m: any) => !m.read && m.sender_id !== meId).length;
      return {
        id: r.id,
        other,
        lastBody: last?.body ?? undefined,
        lastGiftId: last?.gift_id ?? undefined,
        lastSenderId: last?.sender_id,
        updatedAt: r.updated_at,
        unread,
      };
    })
    .filter(Boolean) as ConversationData[];
}

export interface ThreadData {
  id: string;
  other: User;
  messages: { id: string; senderId: string; body?: string; giftId?: string; createdAt: string; read: boolean }[];
}
export async function getConversation(id: string, meId: string): Promise<ThreadData | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("conversations").select("*").eq("id", id).maybeSingle();
  if (!data) return null;
  if (data.user_a !== meId && data.user_b !== meId) return null;
  const otherId = data.user_a === meId ? data.user_b : data.user_a;
  const other = (await profilesByIds([otherId])).get(otherId);
  if (!other) return null;
  const { data: msgs } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", id)
    .order("created_at", { ascending: true });
  return {
    id,
    other,
    messages: (msgs ?? []).map((m: any) => ({
      id: m.id,
      senderId: m.sender_id,
      body: m.body ?? undefined,
      giftId: m.gift_id ?? undefined,
      createdAt: m.created_at,
      read: m.read,
    })),
  };
}

// -------- notifications --------
export interface NotifData {
  id: string;
  type: string;
  actor?: User;
  giftId?: string;
  meta?: Record<string, any>;
  read: boolean;
  createdAt: string;
}
export async function listNotifications(): Promise<NotifData[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);
  const rows = data ?? [];
  const actorIds = rows.map((r: any) => r.actor_id).filter(Boolean);
  const profiles = await profilesByIds(actorIds);
  return rows.map((r: any) => ({
    id: r.id,
    type: r.type,
    actor: r.actor_id ? profiles.get(r.actor_id) : undefined,
    giftId: r.gift_id ?? undefined,
    meta: r.meta ?? undefined,
    read: r.read,
    createdAt: r.created_at,
  }));
}

// -------- couples --------
export interface CoupleData {
  couple: Couple;
  a: User;
  b: User;
}
function mapCouple(r: any): Couple {
  return {
    id: r.id,
    userIds: [r.user_a, r.user_b],
    since: r.since,
    streakDays: r.streak_days,
    type: r.type,
    sharedGames: r.shared_games ?? [],
    giftsExchanged: r.gifts_exchanged,
    history: (r.couple_events ?? [])
      .map((e: any) => ({
        id: e.id,
        date: e.event_date,
        fromUserId: e.from_id,
        giftId: e.gift_id ?? undefined,
        label: e.label,
      }))
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    achievements: (r.couple_achievements ?? []).map((a: any) => ({
      id: a.id,
      label: a.label,
      icon: a.icon,
      unlockedAt: a.unlocked_at ?? undefined,
    })),
    pet: r.couple_pets
      ? {
          name: r.couple_pets.name,
          species: r.couple_pets.species,
          level: r.couple_pets.level,
          happiness: r.couple_pets.happiness,
          accessories: r.couple_pets.accessories ?? [],
        }
      : undefined,
  };
}
export async function listCouples(): Promise<CoupleData[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("couples")
    .select("*, couple_events(*), couple_achievements(*), couple_pets(*)")
    .order("streak_days", { ascending: false });
  const rows = data ?? [];
  const ids = Array.from(new Set(rows.flatMap((r: any) => [r.user_a, r.user_b])));
  const profiles = await profilesByIds(ids);
  return rows
    .map((r: any) => {
      const a = profiles.get(r.user_a);
      const b = profiles.get(r.user_b);
      if (!a || !b) return null;
      return { couple: mapCouple(r), a, b };
    })
    .filter(Boolean) as CoupleData[];
}
export async function getCoupleByUser(userId: string): Promise<CoupleData | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("couples")
    .select("*, couple_events(*), couple_achievements(*), couple_pets(*)")
    .or(`user_a.eq.${userId},user_b.eq.${userId}`)
    .maybeSingle();
  if (!data) return null;
  const profiles = await profilesByIds([data.user_a, data.user_b]);
  const a = profiles.get(data.user_a);
  const b = profiles.get(data.user_b);
  if (!a || !b) return null;
  return { couple: mapCouple(data), a, b };
}

export async function getCoupleById(id: string): Promise<CoupleData | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("couples")
    .select("*, couple_events(*), couple_achievements(*), couple_pets(*)")
    .eq("id", id)
    .maybeSingle();
  if (!data) return null;
  const profiles = await profilesByIds([data.user_a, data.user_b]);
  const a = profiles.get(data.user_a);
  const b = profiles.get(data.user_b);
  if (!a || !b) return null;
  return { couple: mapCouple(data), a, b };
}

// -------- collection --------
export interface OwnedGiftData {
  id: string;
  gift: Gift;
  from?: User;
  serial?: number;
  receivedAt: string;
}
export async function getCollection(userId: string, limit = 24): Promise<OwnedGiftData[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("owned_gifts")
    .select("*")
    .eq("owner_id", userId)
    .order("received_at", { ascending: false })
    .limit(limit);
  const rows = data ?? [];
  const fromIds = rows.map((r: any) => r.from_id).filter(Boolean);
  const profiles = await profilesByIds(fromIds);
  return rows
    .map((r: any) => {
      const gift = getGift(r.gift_id);
      if (!gift) return null;
      return {
        id: r.id,
        gift,
        from: r.from_id ? profiles.get(r.from_id) : undefined,
        serial: r.serial ?? undefined,
        receivedAt: r.received_at,
      };
    })
    .filter(Boolean) as OwnedGiftData[];
}

// -------- flex battles --------
export interface BattleData {
  id: string;
  a: User;
  b: User;
  scoreA: number;
  scoreB: number;
  endsAt: string;
  startedAt: string;
}
export async function listBattles(): Promise<BattleData[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("flex_battles").select("*").order("ends_at", { ascending: true });
  const rows = data ?? [];
  const ids = Array.from(new Set(rows.flatMap((r: any) => [r.user_a, r.user_b])));
  const profiles = await profilesByIds(ids);
  return rows
    .map((r: any) => {
      const a = profiles.get(r.user_a);
      const b = profiles.get(r.user_b);
      if (!a || !b) return null;
      return { id: r.id, a, b, scoreA: r.score_a, scoreB: r.score_b, endsAt: r.ends_at, startedAt: r.started_at };
    })
    .filter(Boolean) as BattleData[];
}

export async function getBattleById(id: string): Promise<BattleData | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("flex_battles").select("*").eq("id", id).maybeSingle();
  if (!data) return null;
  const profiles = await profilesByIds([data.user_a, data.user_b]);
  const a = profiles.get(data.user_a);
  const b = profiles.get(data.user_b);
  if (!a || !b) return null;
  return { id: data.id, a, b, scoreA: data.score_a, scoreB: data.score_b, endsAt: data.ends_at, startedAt: data.started_at };
}
