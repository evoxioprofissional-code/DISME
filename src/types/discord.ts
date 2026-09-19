export interface DiscordBadge {
  key: string;
  label: string;
}

export interface DiscordIdentityVersion {
  id: number;
  username: string;
  displayName: string | null;
  avatarUrl: string;
  bannerUrl: string | null;
  observedAt: string;
  firstSeen: boolean;
}

export interface DiscordPublicUser {
  id: string;
  username: string;
  displayName: string | null;
  discriminator: string | null;
  avatarUrl: string;
  bannerUrl: string | null;
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
}

export interface DiscordLookupResult {
  user: DiscordPublicUser;
  history: DiscordIdentityVersion[];
  cached: boolean;
}
