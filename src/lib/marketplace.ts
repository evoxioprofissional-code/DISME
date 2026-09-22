import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { MarketplaceCategory, MarketplaceListing, MarketplaceListingKind } from "@/types/marketplace";

/* eslint-disable @typescript-eslint/no-explicit-any */

const LISTING_SELECT = `
  *,
  seller:profiles!marketplace_listings_seller_id_fkey(
    id,username,display_name,avatar_url,
    connections(platform,handle,detail)
  )
`;

function mapListing(row: any, favorite = false): MarketplaceListing {
  const discord = (row.seller?.connections ?? []).find((item: any) => item.platform === "discord");
  return {
    id: row.id,
    sellerId: row.seller_id,
    kind: row.kind,
    category: row.category,
    title: row.title,
    description: row.description,
    priceCents: row.price_cents ?? undefined,
    currency: row.currency,
    platform: row.platform ?? undefined,
    transferMethod: row.transfer_method ?? undefined,
    images: row.images ?? [],
    tags: row.tags ?? [],
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    seller: {
      id: row.seller.id,
      username: row.seller.username,
      displayName: row.seller.display_name,
      avatar: row.seller.avatar_url ?? "",
      discordHandle: discord?.handle ?? undefined,
      discordId: discord?.detail && /^\d{16,22}$/.test(discord.detail) ? discord.detail : undefined,
    },
    favorite,
  };
}

export async function listMarketplaceListings({
  kind = "market",
  category,
  search,
}: {
  kind?: MarketplaceListingKind;
  category?: MarketplaceCategory;
  search?: string;
} = {}): Promise<MarketplaceListing[]> {
  const supabase = await createClient();
  let query = supabase
    .from("marketplace_listings")
    .select(LISTING_SELECT)
    .eq("status", "active")
    .eq("kind", kind)
    .order("created_at", { ascending: false })
    .limit(60);

  if (category && category !== "account_showcase") query = query.eq("category", category);
  const cleanSearch = search?.trim().replace(/[%_]/g, "").slice(0, 60);
  if (cleanSearch) query = query.ilike("title", `%${cleanSearch}%`);

  const { data } = await query;
  const rows = data ?? [];
  const { data: auth } = await supabase.auth.getUser();
  let favorites = new Set<string>();
  if (auth.user && rows.length) {
    const { data: favoriteRows } = await supabase
      .from("marketplace_favorites")
      .select("listing_id")
      .eq("profile_id", auth.user.id)
      .in("listing_id", rows.map((row: any) => row.id));
    favorites = new Set((favoriteRows ?? []).map((row: any) => row.listing_id));
  }
  return rows.map((row: any) => mapListing(row, favorites.has(row.id)));
}

export async function getMarketplaceListing(id: string): Promise<MarketplaceListing | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("marketplace_listings")
    .select(LISTING_SELECT)
    .eq("id", id)
    .maybeSingle();
  if (!data) return null;
  const { data: auth } = await supabase.auth.getUser();
  let favorite = false;
  if (auth.user) {
    const { data: favoriteRow } = await supabase
      .from("marketplace_favorites")
      .select("listing_id")
      .eq("profile_id", auth.user.id)
      .eq("listing_id", id)
      .maybeSingle();
    favorite = Boolean(favoriteRow);
  }
  return mapListing(data, favorite);
}
