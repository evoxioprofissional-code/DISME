// DisMe — modelos de domínio usados entre o Supabase e a interface.

export type Rarity = "common" | "rare" | "epic" | "legendary" | "limited";

export type Intent = "namoro" | "amizade" | "duo" | "conversar";

export type RelationshipStatus =
  | "solteiro"
  | "namorando"
  | "webnamoro"
  | "complicado"
  | "reservado";

export type Gender = "masculino" | "feminino" | "nao-binario" | "outro";

export type PresenceState = "online" | "ausente" | "ocupado" | "offline";

export interface Game {
  id: string;
  name: string;
  /** short tag used on chips, e.g. "CS2" */
  short: string;
}

export interface Badge {
  id: string;
  label: string;
  /** lucide icon name resolved in the UI layer */
  icon: string;
  rarity?: Rarity;
}

export interface SocialConnection {
  platform: "steam" | "spotify" | "riot" | "twitch" | "discord";
  handle: string;
  /** optional now-playing / status line */
  detail?: string;
}

export interface UserStats {
  flex: number;
  giftsReceived: number;
  giftsSent: number;
  matches: number;
  followers: number;
  collectionCount: number;
}

export interface User {
  id: string;
  username: string;
  displayName: string;
  age: number;
  pronouns?: string;
  location?: string;
  bio: string;
  avatar: string;
  banner?: string;
  presence: PresenceState;
  /** minutes since last seen, when offline */
  lastSeenMin?: number;
  gender: Gender;
  intent: Intent;
  relationship: RelationshipStatus;
  /** id of partner user when in a relationship */
  partnerId?: string;
  games: string[]; // Game ids
  interests: string[];
  badges: Badge[];
  connections: SocialConnection[];
  stats: UserStats;
  /** rank position on the global Flex board */
  flexRank?: number;
  isCrush?: boolean;
  liked?: boolean;
  onboarded?: boolean;
}

export interface Gift {
  id: string;
  name: string;
  rarity: Rarity;
  /** cost in DisMe credits */
  price: number;
  category: GiftCategory;
  /** total minted, when limited */
  supply?: number;
  minted?: number;
  description: string;
  /** flex value granted */
  flexValue: number;
}

export type GiftCategory =
  | "populares"
  | "romanticos"
  | "raros"
  | "colecionaveis"
  | "limitados";

export interface OwnedGift {
  id: string;
  giftId: string;
  fromUserId: string;
  receivedAt: string; // ISO
  /** serial when the gift is limited */
  serial?: number;
}

export type FeedType =
  | "relationship"
  | "gift"
  | "ranking"
  | "milestone"
  | "profile"
  | "collection"
  | "match";

export interface FeedActivity {
  id: string;
  type: FeedType;
  actors: string[]; // user ids involved
  createdAt: string; // ISO
  /** referenced gift, when relevant */
  giftId?: string;
  /** freeform values (rank number, day count, etc.) */
  meta?: Record<string, string | number>;
}

export interface Match {
  id: string;
  userId: string;
  matchedAt: string; // ISO
  isNew: boolean;
  viaCrush?: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  body?: string;
  giftId?: string;
  createdAt: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  userId: string; // the other participant
  messages: Message[];
  updatedAt: string;
  unread: number;
  matchedAt?: string;
}

export type NotificationType =
  | "match"
  | "gift"
  | "crush"
  | "milestone"
  | "ranking"
  | "relationship"
  | "message";

export interface AppNotification {
  id: string;
  type: NotificationType;
  actorId?: string;
  createdAt: string;
  read: boolean;
  giftId?: string;
  meta?: Record<string, string | number>;
}

export interface Couple {
  id: string;
  userIds: [string, string];
  since: string; // ISO start date
  streakDays: number;
  type: RelationshipStatus;
  sharedGames: string[];
  giftsExchanged: number;
  history: CoupleEvent[];
  pet?: CouplePet;
  achievements: CoupleAchievement[];
}

export interface CoupleEvent {
  id: string;
  date: string; // ISO
  fromUserId: string;
  giftId?: string;
  label: string;
}

export interface CoupleAchievement {
  id: string;
  label: string;
  icon: string;
  unlockedAt?: string;
}

export interface CouplePet {
  name: string;
  species: string;
  level: number;
  happiness: number; // 0-100
  accessories: string[];
}

export type RankingCategory =
  | "flex"
  | "presenteados"
  | "colecionadores"
  | "casais"
  | "streaks";

export interface RankingEntry {
  rank: number;
  userId?: string;
  coupleId?: string;
  value: number;
  /** movement vs last period */
  delta?: number;
}

export interface FlexBattle {
  id: string;
  userIds: [string, string];
  scores: [number, number];
  endsAt: string; // ISO
  startedAt: string;
}
