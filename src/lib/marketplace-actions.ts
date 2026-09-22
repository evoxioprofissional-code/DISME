"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { MarketplaceCategory, MarketplaceListingKind } from "@/types/marketplace";

export interface MarketplaceFormState { error?: string }
export interface StoreFormState { error?: string }

const MARKET_CATEGORIES = new Set<MarketplaceCategory>(["item", "service", "peripheral", "collectible"]);

function text(form: FormData, key: string, max: number) {
  return String(form.get(key) ?? "").trim().slice(0, max);
}

async function requireUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, user };
}

function normalizeSlug(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9_]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 30);
}

function ownedMediaUrl(url: string, bucket: string, userId: string) {
  const base = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${userId}/`;
  return url.startsWith(base) ? url : null;
}

export async function saveStore(_previous: StoreFormState, form: FormData): Promise<StoreFormState> {
  const { supabase, user } = await requireUser();
  if (!user) return { error: "Entre na sua conta para criar uma loja." };
  const name = text(form, "name", 60);
  const slug = normalizeSlug(text(form, "slug", 50));
  const description = text(form, "description", 500);
  const rawAvatar = text(form, "avatar_url", 500);
  const rawBanner = text(form, "banner_url", 500);
  const isPublished = form.get("is_published") === "on";
  if (name.length < 3) return { error: "O nome da loja precisa ter pelo menos 3 caracteres." };
  if (slug.length < 3) return { error: "Escolha um endereço com pelo menos 3 letras ou números." };

  const { data: existing } = await supabase.from("marketplace_stores").select("id,avatar_url,banner_url").eq("owner_id", user.id).maybeSingle();
  const avatarUrl = rawAvatar ? ownedMediaUrl(rawAvatar, "store-media", user.id) ?? (rawAvatar === existing?.avatar_url ? rawAvatar : null) : null;
  const bannerUrl = rawBanner ? ownedMediaUrl(rawBanner, "store-media", user.id) ?? (rawBanner === existing?.banner_url ? rawBanner : null) : null;
  const payload = { owner_id: user.id, name, slug, description, avatar_url: avatarUrl, banner_url: bannerUrl, is_published: isPublished };
  const operation = existing
    ? supabase.from("marketplace_stores").update(payload).eq("owner_id", user.id).select("slug").single()
    : supabase.from("marketplace_stores").insert(payload).select("slug").single();
  const { data, error } = await operation;
  if (error || !data) {
    if (error?.code === "23505") return { error: "Esse endereço de loja já está em uso." };
    return { error: "Não foi possível salvar a loja agora." };
  }
  revalidatePath("/marketplace");
  revalidatePath("/store/manage");
  revalidatePath(`/store/${data.slug}`);
  revalidatePath("/profile", "layout");
  redirect("/store/manage");
}

type ListingInput = {
  kind: MarketplaceListingKind;
  category: MarketplaceCategory;
  title: string;
  description: string;
  platform: string | null;
  transferMethod: string | null;
  tags: string[];
  images: string[];
  priceCents: number | null;
};

function parseListing(form: FormData, userId: string): ListingInput | { error: string } {
  const kind = (form.get("kind") === "showcase" ? "showcase" : "market") as MarketplaceListingKind;
  const requestedCategory = String(form.get("category") ?? "") as MarketplaceCategory;
  const category: MarketplaceCategory = kind === "showcase" ? "account_showcase" : requestedCategory;
  const title = text(form, "title", 80);
  const description = text(form, "description", 1600);
  const platform = text(form, "platform", 40) || null;
  const transferMethod = kind === "market" ? text(form, "transfer_method", 120) || null : null;
  const tags = Array.from(new Set(text(form, "tags", 240).split(",").map((tag) => tag.trim()).filter(Boolean))).slice(0, 8);
  let images: string[] = [];
  try {
    const value = JSON.parse(String(form.get("images") ?? "[]"));
    if (Array.isArray(value)) images = value.filter((url): url is string => typeof url === "string" && Boolean(ownedMediaUrl(url, "marketplace-media", userId))).slice(0, 5);
  } catch { return { error: "As imagens não puderam ser processadas." }; }
  if (title.length < 4) return { error: "Use um título com pelo menos 4 caracteres." };
  if (description.length < 20) return { error: "A descrição precisa ter pelo menos 20 caracteres." };
  if (kind === "market" && !MARKET_CATEGORIES.has(category)) return { error: "Contas só podem aparecer como exposição." };
  let priceCents: number | null = null;
  if (kind === "market") {
    const price = Number(text(form, "price", 20).replace(/\./g, "").replace(",", "."));
    if (!Number.isFinite(price) || price < 0) return { error: "Informe um valor válido." };
    priceCents = Math.round(price * 100);
  }
  return { kind, category, title, description, platform, transferMethod, tags, images, priceCents };
}

export async function createMarketplaceListing(_previous: MarketplaceFormState, form: FormData): Promise<MarketplaceFormState> {
  const { supabase, user } = await requireUser();
  if (!user) return { error: "Entre na sua conta para publicar." };
  const { data: store } = await supabase.from("marketplace_stores").select("id").eq("owner_id", user.id).maybeSingle();
  if (!store) return { error: "Crie sua loja antes de publicar." };
  const input = parseListing(form, user.id);
  if ("error" in input) return input;
  const { data, error } = await supabase.from("marketplace_listings").insert({
    seller_id: user.id,
    store_id: store.id,
    kind: input.kind,
    category: input.category,
    title: input.title,
    description: input.description,
    price_cents: input.priceCents,
    platform: input.platform,
    transfer_method: input.transferMethod,
    images: input.images,
    tags: input.tags,
  }).select("id").single();
  if (error || !data) return { error: "Não foi possível publicar agora." };
  revalidatePath("/marketplace");
  revalidatePath("/store/manage");
  redirect(`/marketplace/${data.id}`);
}

export async function updateMarketplaceListing(_previous: MarketplaceFormState, form: FormData): Promise<MarketplaceFormState> {
  const { supabase, user } = await requireUser();
  if (!user) return { error: "Entre na sua conta para editar." };
  const listingId = text(form, "listing_id", 60);
  const input = parseListing(form, user.id);
  if ("error" in input) return input;
  const { data, error } = await supabase.from("marketplace_listings").update({
    kind: input.kind,
    category: input.category,
    title: input.title,
    description: input.description,
    price_cents: input.priceCents,
    platform: input.platform,
    transfer_method: input.transferMethod,
    images: input.images,
    tags: input.tags,
  }).eq("id", listingId).eq("seller_id", user.id).select("id").maybeSingle();
  if (error || !data) return { error: "Não foi possível salvar as alterações." };
  revalidatePath("/marketplace");
  revalidatePath("/store/manage");
  revalidatePath(`/marketplace/${listingId}`);
  redirect(`/marketplace/${listingId}`);
}

export async function setMarketplaceListingStatus(form: FormData) {
  const { supabase, user } = await requireUser();
  if (!user) redirect("/login");
  const id = text(form, "listing_id", 60);
  const status = form.get("status") === "active" ? "active" : "paused";
  await supabase.from("marketplace_listings").update({ status }).eq("id", id).eq("seller_id", user.id);
  revalidatePath("/marketplace");
  revalidatePath("/store/manage");
}

export async function deleteMarketplaceListing(form: FormData) {
  const { supabase, user } = await requireUser();
  if (!user) redirect("/login");
  const id = text(form, "listing_id", 60);
  await supabase.from("marketplace_listings").delete().eq("id", id).eq("seller_id", user.id);
  revalidatePath("/marketplace");
  revalidatePath("/store/manage");
  redirect("/store/manage");
}

export async function toggleMarketplaceFavorite(form: FormData) {
  const { supabase, user } = await requireUser();
  const listingId = String(form.get("listing_id") ?? "");
  if (!user) redirect(`/login?next=/marketplace/${listingId}`);
  const { data } = await supabase.from("marketplace_favorites").select("listing_id").eq("profile_id", user.id).eq("listing_id", listingId).maybeSingle();
  if (data) await supabase.from("marketplace_favorites").delete().eq("profile_id", user.id).eq("listing_id", listingId);
  else await supabase.from("marketplace_favorites").insert({ profile_id: user.id, listing_id: listingId });
  revalidatePath("/marketplace");
  revalidatePath(`/marketplace/${listingId}`);
}

export async function reportMarketplaceListing(form: FormData) {
  const { supabase, user } = await requireUser();
  const listingId = String(form.get("listing_id") ?? "");
  if (!user) redirect(`/login?next=/marketplace/${listingId}`);
  const allowed = new Set(["prohibited_sale", "scam", "misleading", "stolen_content", "other"]);
  const reason = String(form.get("reason") ?? "other");
  await supabase.from("marketplace_reports").insert({
    listing_id: listingId,
    reporter_id: user.id,
    reason: allowed.has(reason) ? reason : "other",
    details: text(form, "details", 500) || null,
  });
  redirect(`/marketplace/${listingId}?reported=1`);
}
