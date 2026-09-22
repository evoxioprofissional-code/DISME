import type { MarketplaceSeller } from "@/types/marketplace";

export interface DiscordServerListing {
  id: string;
  ownerProfileId: string;
  guildId: string;
  discordOwnerId: string;
  name: string;
  discordDescription?: string;
  promoText: string;
  iconUrl?: string;
  bannerUrl?: string;
  splashUrl?: string;
  inviteUrl?: string;
  memberCount: number;
  onlineCount: number;
  boostCount: number;
  boostTier: number;
  verificationLevel: number;
  preferredLocale?: string;
  channelCount: number;
  roleCount: number;
  emojiCount: number;
  features: string[];
  tags: string[];
  isPublished: boolean;
  syncedAt: string;
  createdAt: string;
  updatedAt: string;
  owner: MarketplaceSeller;
}

export interface DiscordGuildSnapshot {
  guildId: string;
  ownerId: string;
  name: string;
  description?: string;
  iconUrl?: string;
  bannerUrl?: string;
  splashUrl?: string;
  memberCount: number;
  onlineCount: number;
  boostCount: number;
  boostTier: number;
  verificationLevel: number;
  preferredLocale?: string;
  channelCount: number;
  roleCount: number;
  emojiCount: number;
  features: string[];
}
