export type MarketplaceListingKind = "market" | "showcase";
export type MarketplaceCategory = "item" | "service" | "peripheral" | "collectible" | "account_showcase";
export type MarketplaceStatus = "active" | "paused" | "closed" | "removed";

export interface MarketplaceSeller {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  discordHandle?: string;
  discordId?: string;
}

export interface MarketplaceStoreSummary {
  id: string;
  slug: string;
  name: string;
  avatar?: string;
  banner?: string;
}

export interface MarketplaceStore extends MarketplaceStoreSummary {
  ownerId: string;
  description: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  owner: MarketplaceSeller;
  productCount: number;
  showcaseCount: number;
}

export interface MarketplaceListing {
  id: string;
  sellerId: string;
  storeId: string;
  kind: MarketplaceListingKind;
  category: MarketplaceCategory;
  title: string;
  description: string;
  priceCents?: number;
  currency: "BRL";
  platform?: string;
  transferMethod?: string;
  images: string[];
  tags: string[];
  status: MarketplaceStatus;
  createdAt: string;
  updatedAt: string;
  seller: MarketplaceSeller;
  store: MarketplaceStoreSummary;
  favorite?: boolean;
}

export const marketplaceCategoryLabels: Record<MarketplaceCategory, string> = {
  item: "Itens digitais",
  service: "Serviços",
  peripheral: "Periféricos",
  collectible: "Colecionáveis",
  account_showcase: "Conta em exposição",
};
