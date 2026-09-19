import type {
  AppNotification,
  Conversation,
  Couple,
  FeedActivity,
  FlexBattle,
  Match,
  RankingCategory,
  RankingEntry,
} from "@/types";
import { users } from "./users";

// Relative time helpers so the mock always looks "fresh".
const now = Date.now();
const min = (m: number) => new Date(now - m * 60_000).toISOString();
const hr = (h: number) => new Date(now - h * 3_600_000).toISOString();
const day = (d: number) => new Date(now - d * 86_400_000).toISOString();
const inHours = (h: number) => new Date(now + h * 3_600_000).toISOString();

export const feed: FeedActivity[] = [
  {
    id: "f1",
    type: "relationship",
    actors: ["u4", "u3"],
    createdAt: min(8),
    meta: { kind: "namoro" },
  },
  { id: "f2", type: "gift", actors: ["u15", "u10"], giftId: "galaxia", createdAt: min(23) },
  { id: "f3", type: "ranking", actors: ["u7"], createdAt: min(41), meta: { board: "Flex", rank: 5, moved: 300 } },
  { id: "f4", type: "milestone", actors: ["u8", "u10"], createdAt: hr(2), meta: { days: 100 } },
  { id: "f5", type: "profile", actors: ["u9"], createdAt: hr(3) },
  { id: "f6", type: "collection", actors: ["u3"], giftId: "coroa-cristal", createdAt: hr(4), meta: { serial: 42 } },
  { id: "f7", type: "gift", actors: ["u2", "u5"], giftId: "trono", createdAt: hr(6) },
  { id: "f8", type: "match", actors: ["u11", "u14"], createdAt: hr(7) },
  { id: "f9", type: "ranking", actors: ["u16"], createdAt: hr(9), meta: { board: "Flex", rank: 88, moved: 40 } },
  { id: "f10", type: "milestone", actors: ["u1"], createdAt: hr(11), meta: { collection: 41 } },
  { id: "f11", type: "gift", actors: ["u13", "u6"], giftId: "rosa", createdAt: hr(13) },
  { id: "f12", type: "relationship", actors: ["u8", "u10"], createdAt: day(1), meta: { kind: "webnamoro" } },
];

export const matches: Match[] = [
  { id: "m1", userId: "u6", matchedAt: min(4), isNew: true },
  { id: "m2", userId: "u11", matchedAt: min(52), isNew: true, viaCrush: true },
  { id: "m3", userId: "u13", matchedAt: hr(5), isNew: false },
  { id: "m4", userId: "u15", matchedAt: hr(20), isNew: false },
  { id: "m5", userId: "u16", matchedAt: day(2), isNew: false },
  { id: "m6", userId: "u5", matchedAt: day(3), isNew: false },
];

export const conversations: Conversation[] = [
  {
    id: "c1",
    userId: "u6",
    matchedAt: min(4),
    unread: 2,
    updatedAt: min(2),
    messages: [
      { id: "msg1", senderId: "u6", body: "eae, vi que você joga stardew também", createdAt: min(4), read: true },
      { id: "msg2", senderId: "u6", body: "bora montar uma fazenda coop?", createdAt: min(3), read: false },
      { id: "msg3", senderId: "u6", body: "prometo não deixar as galinhas morrerem dessa vez", createdAt: min(2), read: false },
    ],
  },
  {
    id: "c2",
    userId: "u11",
    matchedAt: min(52),
    unread: 0,
    updatedAt: min(30),
    messages: [
      { id: "msg4", senderId: "u1", body: "sup main? finalmente achei minha adc", createdAt: min(50), read: true },
      { id: "msg5", senderId: "u11", body: "kkkk depende, você trava sob pressão?", createdAt: min(44), read: true },
      { id: "msg6", senderId: "u1", body: "só quando você tá na call", createdAt: min(40), read: true },
      { id: "msg7", senderId: "u11", body: "resposta certa", createdAt: min(30), read: true },
    ],
  },
  {
    id: "c3",
    userId: "u15",
    unread: 1,
    updatedAt: hr(1),
    messages: [
      { id: "msg8", senderId: "u15", body: "obrigada pelo presente, foi raro mesmo?", createdAt: hr(2), read: true },
      { id: "msg9", senderId: "u1", giftId: "galaxia", createdAt: hr(2), read: true },
      { id: "msg10", senderId: "u15", body: "tô sem palavras", createdAt: hr(1), read: false },
    ],
  },
  {
    id: "c4",
    userId: "u5",
    unread: 0,
    updatedAt: day(1),
    messages: [
      { id: "msg11", senderId: "u5", body: "vamo de valorant mais tarde?", createdAt: day(1), read: true },
      { id: "msg12", senderId: "u1", body: "fechou, chama na call", createdAt: day(1), read: true },
    ],
  },
  {
    id: "c5",
    userId: "u13",
    unread: 0,
    updatedAt: day(2),
    messages: [
      { id: "msg13", senderId: "u13", body: "sua playlist é impecável", createdAt: day(2), read: true },
      { id: "msg14", senderId: "u1", body: "haha valeu, madrugada pede lo-fi", createdAt: day(2), read: true },
    ],
  },
];

export const notifications: AppNotification[] = [
  { id: "n1", type: "match", actorId: "u6", createdAt: min(4), read: false },
  { id: "n2", type: "gift", actorId: "u15", giftId: "galaxia", createdAt: min(23), read: false },
  { id: "n3", type: "crush", actorId: "u11", createdAt: min(52), read: false },
  { id: "n4", type: "ranking", createdAt: hr(3), read: true, meta: { rank: 12, board: "Flex" } },
  { id: "n5", type: "gift", actorId: "u10", giftId: "coroa", createdAt: hr(8), read: true },
  { id: "n6", type: "milestone", createdAt: day(1), read: true, meta: { collection: 41 } },
  { id: "n7", type: "message", actorId: "u13", createdAt: day(2), read: true },
];

// ---- Rankings ----
function boardBy(field: (u: (typeof users)[number]) => number): RankingEntry[] {
  return [...users]
    .sort((a, b) => field(b) - field(a))
    .slice(0, 20)
    .map((u, i) => ({
      rank: i + 1,
      userId: u.id,
      value: field(u),
      delta: [3, 3, 2, 0, 1, -1, 4, 0, -2, 1][i] ?? 0,
    }));
}

export const rankings: Record<RankingCategory, RankingEntry[]> = {
  flex: boardBy((u) => u.stats.flex),
  presenteados: boardBy((u) => u.stats.giftsReceived),
  colecionadores: boardBy((u) => u.stats.collectionCount),
  streaks: [], // filled below (couples)
  casais: [], // filled below (couples)
};

// ---- Couples ----
export const couples: Couple[] = [
  {
    id: "cp1",
    userIds: ["u4", "u3"],
    since: day(183),
    streakDays: 183,
    type: "namorando",
    sharedGames: ["minecraft", "stardew"],
    giftsExchanged: 46,
    pet: { name: "Pixel", species: "Raposa", level: 12, happiness: 88, accessories: ["coleira-dourada", "gorro"] },
    achievements: [
      { id: "a1", label: "100 dias juntos", icon: "heart-handshake", unlockedAt: day(83) },
      { id: "a2", label: "50 presentes trocados", icon: "gift", unlockedAt: day(20) },
      { id: "a3", label: "Streak de 6 meses", icon: "flame", unlockedAt: day(3) },
      { id: "a4", label: "Duo invicto", icon: "swords" },
    ],
    history: [
      { id: "e1", date: day(183), fromUserId: "u4", label: "Começaram o namoro" },
      { id: "e2", date: day(170), fromUserId: "u4", giftId: "rosa", label: "enviou Rosa" },
      { id: "e3", date: day(150), fromUserId: "u3", giftId: "carta", label: "enviou Carta" },
      { id: "e4", date: day(83), fromUserId: "u4", giftId: "alianca", label: "enviou Aliança" },
      { id: "e5", date: day(10), fromUserId: "u3", giftId: "coroa", label: "enviou Coroa" },
    ],
  },
  {
    id: "cp2",
    userIds: ["u10", "u8"],
    since: day(100),
    streakDays: 100,
    type: "webnamoro",
    sharedGames: ["genshin", "amongus"],
    giftsExchanged: 31,
    pet: { name: "Nuvem", species: "Gato", level: 8, happiness: 72, accessories: ["laço"] },
    achievements: [
      { id: "a5", label: "100 dias juntos", icon: "heart-handshake", unlockedAt: hr(2) },
      { id: "a6", label: "Primeiro presente raro", icon: "gem", unlockedAt: day(60) },
    ],
    history: [
      { id: "e6", date: day(100), fromUserId: "u10", label: "Começaram o webnamoro" },
      { id: "e7", date: day(90), fromUserId: "u10", giftId: "galaxia", label: "enviou Galáxia" },
      { id: "e8", date: day(45), fromUserId: "u8", giftId: "ursinho", label: "enviou Ursinho" },
    ],
  },
];

const coupleMap = new Map(couples.map((c) => [c.id, c]));
export function getCouple(id: string): Couple | undefined {
  return coupleMap.get(id);
}
export function getCoupleByUser(userId: string): Couple | undefined {
  return couples.find((c) => c.userIds.includes(userId));
}

rankings.casais = couples
  .map((c, i) => ({ rank: i + 1, coupleId: c.id, value: c.giftsExchanged, delta: i === 0 ? 0 : 1 }))
  .sort((a, b) => b.value - a.value)
  .map((e, i) => ({ ...e, rank: i + 1 }));

rankings.streaks = couples
  .map((c) => ({ coupleId: c.id, value: c.streakDays }))
  .sort((a, b) => b.value - a.value)
  .map((e, i) => ({ ...e, rank: i + 1, delta: 0 }));

// ---- Flex battles ----
export const battles: FlexBattle[] = [
  {
    id: "bt1",
    userIds: ["u2", "u5"],
    scores: [48290, 45810],
    startedAt: day(1),
    endsAt: inHours(14),
  },
  {
    id: "bt2",
    userIds: ["u7", "u10"],
    scores: [22140, 24680],
    startedAt: hr(20),
    endsAt: inHours(31),
  },
];

const battleMap = new Map(battles.map((b) => [b.id, b]));
export function getBattle(id: string): FlexBattle | undefined {
  return battleMap.get(id);
}
