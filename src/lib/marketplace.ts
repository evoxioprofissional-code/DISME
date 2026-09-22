import "server-only";
import { createClient } from "@/lib/supabase/server";
import type {
  MarketplaceCategory,
  MarketplaceListing,
  MarketplaceListingKind,
  MarketplaceSeller,
  MarketplaceStore,
} from "@/types/marketplace";

/* eslint-disable @typescript-eslint/no-explicit-any */

const SELLER_SELECT = "id,username,display_name,avatar_url,connections(platform,handle,detail)";
const LISTING_SELECT = `
  *,
  seller:profiles!marketplace_listings_seller_id_fkey(${SELLER_SELECT}),
  store:marketplace_stores!marketplace_listings_store_id_fkey(id,slug,name,avatar_url,banner_url)
`;
const STORE_SELECT = `*,owner:profiles!marketplace_stores_owner_id_fkey(${SELLER_SELECT})`;

function mapSeller(row: any): MarketplaceSeller {
  const discord = (row?.connections ?? []).find((item: any) => item.platform === "discord");
  return {
    id: row.id,
    username: row.username,
    displayName: row.display_name,
    avatar: row.avatar_url ?? "",
    discordHandle: discord?.handle ?? undefined,
    discordId: discord?.detail && /^\d{16,22}$/.test(discord.detail) ? discord.detail : undefined,
  };
}

function mapListing(row: any, favorite = false): MarketplaceListing {
  return {
    id: row.id,
    sellerId: row.seller_id,
    storeId: row.store_id,
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
    seller: mapSeller(row.seller),
    store: {
      id: row.store.id,
      slug: row.store.slug,
      name: row.store.name,
      avatar: row.store.avatar_url ?? undefined,
      banner: row.store.banner_url ?? undefined,
    },
    favorite,
  };
}

function mapStore(row: any, counts?: { products: number; showcases: number }): MarketplaceStore {
  return {
    id: row.id,
    ownerId: row.owner_id,
    slug: row.slug,
    name: row.name,
    description: row.description ?? "",
    avatar: row.avatar_url ?? undefined,
    banner: row.banner_url ?? undefined,
    isPublished: row.is_published,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    owner: mapSeller(row.owner),
    productCount: counts?.products ?? 0,
    showcaseCount: counts?.showcases ?? 0,
  };
}

async function favoriteIds(rows: any[]) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user || !rows.length) return new Set<string>();
  const { data } = await supabase
    .from("marketplace_favorites")
    .select("listing_id")
    .eq("profile_id", auth.user.id)
    .in("listing_id", rows.map((row) => row.id));
  return new Set((data ?? []).map((row: any) => row.listing_id));
}

export async function listMarketplaceStores(search?: string): Promise<MarketplaceStore[]> {
  const supabase = await createClient();
  let query = supabase
    .from("marketplace_stores")
    .select(STORE_SELECT)
    .eq("is_published", true)
    .order("updated_at", { ascending: false })
    .limit(60);
  const clean = search?.trim().replace(/[%_]/g, "").slice(0, 60);
  if (clean) query = query.ilike("name", `%${clean}%`);
  const { data } = await query;
  const rows = data ?? [];
  if (!rows.length) return [];
  const { data: publications } = await supabase
    .from("marketplace_listings")
    .select("store_id,kind")
    .eq("status", "active")
    .in("store_id", rows.map((row: any) => row.id));
  const counts = new Map<string, { products: number; showcases: number }>();
  for (const item of publications ?? []) {
    const count = counts.get(item.store_id) ?? { products: 0, showcases: 0 };
    if (item.kind === "showcase") count.showcases += 1;
    else count.products += 1;
    counts.set(item.store_id, count);
  }
  return rows.map((row: any) => mapStore(row, counts.get(row.id)));
}

export async function getStoreBySlug(slug: string): Promise<MarketplaceStore | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("marketplace_stores").select(STORE_SELECT).eq("slug", slug).maybeSingle();
  if (!data) return null;
  const publications = await listStoreListings(data.id, data.owner_id);
  return mapStore(data, {
    products: publications.filter((item) => item.kind === "market" && item.status === "active").length,
    showcases: publications.filter((item) => item.kind === "showcase" && item.status === "active").length,
  });
}

export async function getStoreByOwner(ownerId: string): Promise<MarketplaceStore | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("marketplace_stores").select(STORE_SELECT).eq("owner_id", ownerId).maybeSingle();
  return data ? mapStore(data) : null;
}

export async function getMyStore(): Promise<MarketplaceStore | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user ? getStoreByOwner(user.id) : null;
}

export async function listStoreListings(storeId: string, ownerId?: string): Promise<MarketplaceListing[]> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  let query = supabase.from("marketplace_listings").select(LISTING_SELECT).eq("store_id", storeId).order("created_at", { ascending: false });
  if (!auth.user || auth.user.id !== ownerId) query = query.eq("status", "active");
  const { data } = await query;
  const rows = data ?? [];
  const favorites = await favoriteIds(rows);
  return rows.map((row: any) => mapListing(row, favorites.has(row.id)));
}

export async function listMyStoreListings(): Promise<MarketplaceListing[]> {
  const store = await getMyStore();
  return store ? listStoreListings(store.id, store.ownerId) : [];
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
  const clean = search?.trim().replace(/[%_]/g, "").slice(0, 60);
  if (clean) query = query.ilike("title", `%${clean}%`);
  const { data } = await query;
  const rows = data ?? [];
  const favorites = await favoriteIds(rows);
  return rows.map((row: any) => mapListing(row, favorites.has(row.id)));
}

export async function getMarketplaceListing(id: string): Promise<MarketplaceListing | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("marketplace_listings").select(LISTING_SELECT).eq("id", id).maybeSingle();
  if (!data) return null;
  const favorites = await favoriteIds([data]);
  return mapListing(data, favorites.has(data.id));
}
