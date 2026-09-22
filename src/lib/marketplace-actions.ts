"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { MarketplaceCategory, MarketplaceListingKind } from "@/types/marketplace";

export interface MarketplaceFormState {
  error?: string;
}

const MARKET_CATEGORIES = new Set<MarketplaceCategory>(["item", "service", "peripheral", "collectible"]);

function text(form: FormData, key: string, max: number) {
  return String(form.get(key) ?? "").trim().slice(0, max);
}

async function requireUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, user };
}

export async function createMarketplaceListing(
  _previous: MarketplaceFormState,
  form: FormData,
): Promise<MarketplaceFormState> {
  const { supabase, user } = await requireUser();
  if (!user) return { error: "Entre na sua conta para publicar." };

  const kind = (form.get("kind") === "showcase" ? "showcase" : "market") as MarketplaceListingKind;
  const requestedCategory = String(form.get("category") ?? "") as MarketplaceCategory;
  const category: MarketplaceCategory = kind === "showcase" ? "account_showcase" : requestedCategory;
  const title = text(form, "title", 80);
  const description = text(form, "description", 1600);
  const platform = text(form, "platform", 40) || null;
  const transferMethod = kind === "market" ? text(form, "transfer_method", 120) || null : null;
  const rawTags = text(form, "tags", 240);
  const tags = Array.from(new Set(rawTags.split(",").map((tag) => tag.trim()).filter(Boolean))).slice(0, 8);
  let images: string[] = [];
  try {
    const value = JSON.parse(String(form.get("images") ?? "[]"));
    const storageBase = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/marketplace-media/${user.id}/`;
    if (Array.isArray(value)) {
      images = value
        .filter((url): url is string => typeof url === "string" && url.startsWith(storageBase))
        .slice(0, 5);
    }
  } catch {
    return { error: "As imagens do anúncio não puderam ser processadas." };
  }

  if (title.length < 4) return { error: "Use um título com pelo menos 4 caracteres." };
  if (description.length < 20) return { error: "Conte um pouco mais: a descrição precisa ter pelo menos 20 caracteres." };
  if (kind === "market" && !MARKET_CATEGORIES.has(category)) {
    return { error: "Contas não podem ser publicadas como venda. Use a opção Exposição." };
  }

  let priceCents: number | null = null;
  if (kind === "market") {
    const normalized = text(form, "price", 20).replace(/\./g, "").replace(",", ".");
    const price = Number(normalized);
    if (!Number.isFinite(price) || price < 0) return { error: "Informe um valor válido." };
    priceCents = Math.round(price * 100);
  }

  const { data, error } = await supabase
    .from("marketplace_listings")
    .insert({
      seller_id: user.id,
      kind,
      category,
      title,
      description,
      price_cents: priceCents,
      platform,
      transfer_method: transferMethod,
      images,
      tags,
    })
    .select("id")
    .single();

  if (error || !data) return { error: "Não foi possível publicar agora. Confira os campos e tente novamente." };
  revalidatePath("/marketplace");
  redirect(`/marketplace/${data.id}`);
}

export async function toggleMarketplaceFavorite(form: FormData) {
  const { supabase, user } = await requireUser();
  const listingId = String(form.get("listing_id") ?? "");
  if (!user) redirect(`/login?next=/marketplace/${listingId}`);
  const { data } = await supabase
    .from("marketplace_favorites")
    .select("listing_id")
    .eq("profile_id", user.id)
    .eq("listing_id", listingId)
    .maybeSingle();
  if (data) {
    await supabase.from("marketplace_favorites").delete().eq("profile_id", user.id).eq("listing_id", listingId);
  } else {
    await supabase.from("marketplace_favorites").insert({ profile_id: user.id, listing_id: listingId });
  }
  revalidatePath("/marketplace");
  revalidatePath(`/marketplace/${listingId}`);
}

export async function reportMarketplaceListing(form: FormData) {
  const { supabase, user } = await requireUser();
  const listingId = String(form.get("listing_id") ?? "");
  if (!user) redirect(`/login?next=/marketplace/${listingId}`);
  const allowed = new Set(["prohibited_sale", "scam", "misleading", "stolen_content", "other"]);
  const reason = String(form.get("reason") ?? "other");
  const details = text(form, "details", 500) || null;
  await supabase.from("marketplace_reports").insert({
    listing_id: listingId,
    reporter_id: user.id,
    reason: allowed.has(reason) ? reason : "other",
    details,
  });
  redirect(`/marketplace/${listingId}?reported=1`);
}
