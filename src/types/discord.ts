export interface DiscordBadge {
  key: string;
  label: string;
  id: string;
  name: string;
  icon: string;
  description: string;
  source: "discord" | "oathnet" | "namedc" | "disme";
  since: string | null;
}

export interface DiscordIdentityVersion {
  id: number;
  username: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  bannerUrl: string | null;
  observedAt: string;
  firstSeen: boolean;
  source: "discord" | "oathnet" | "namedc" | "disme";
}

export interface DiscordPublicUser {
  id: string;
  username: string;
  displayName: string | null;
  discriminator: string | null;
  avatarUrl: string;
  avatarHash: string | null;
  avatarAnimated: boolean;
  bannerUrl: string | null;
  bannerHash: string | null;
  accentColor: number | null;
  badges: DiscordBadge[];
  bot: boolean;
  system: boolean;
  accountCreatedAt: string;
  firstSeenAt: string;
  lastSeenAt: string;
  primaryGuild: {
    tag: string | null;
    badgeUrl: string | null;
  } | null;
  avatarDecorationUrl: string | null;
  avatarDecorationAsset: string | null;
  avatarDecorationSkuId: string | null;
  avatarDecorationExpiresAt: string | null;
  collectibles: Record<string, unknown> | null;
  nameplate: {
    label: string | null;
    palette: string | null;
    imageUrl: string | null;
  } | null;
  bannerAnimated: boolean;
  isDefaultAvatar: boolean;
  nitroLikely: boolean;
  publicFlagsRaw: number;
  accountAgeDays: number;
  flairs: string[];
  snowflake: {
    timestamp: string;
    workerId: number;
    processId: number;
    increment: number;
  };
  nitro: {
    active: boolean | null;
    type: string | null;
    since: string | null;
  };
  booster: {
    active: boolean | null;
    since: string | null;
  };
}

export interface DiscordLookupResult {
  user: DiscordPublicUser;
  history: DiscordIdentityVersion[];
  cached: boolean;
  providers?: Record<string, { status: string; configured: boolean }>;
}
