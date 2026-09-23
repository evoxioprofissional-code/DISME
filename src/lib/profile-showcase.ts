import "server-only";

import { giftHasAsset } from "@/data/gifts";
import { createClient } from "@/lib/supabase/server";
import { listGiftCatalog } from "@/lib/queries";
import type { Gift } from "@/types";

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface ProfileGiftActor {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
}

export interface ProfileGiftHistoryItem {
  id: string;
  gift: Gift;
  actor?: ProfileGiftActor;
  receivedAt: string;
  creditsSpent?: number;
  direction: "received" | "sent";
}

export interface ProfileCollectionItem {
  gift: Gift;
  quantity: number;
  unlocked: boolean;
}

export interface ProfileShowcaseData {
  catalog: Gift[];
  collection: ProfileCollectionItem[];
  featured: ProfileCollectionItem[];
  received: ProfileGiftHistoryItem[];
  sent: ProfileGiftHistoryItem[];
  activity: ProfileGiftHistoryItem[];
  stats: {
    giftsReceived: number;
    giftsSent: number;
    creditsSent: number;
    unlocked: number;
    catalogTotal: number;
    followers: number;
    following: number;
  };
}

const HISTORY_LIMIT = 40;

function mapActor(row: any): ProfileGiftActor {
  return {
    id: row.id,
    username: row.username,
    displayName: row.display_name,
    avatar: row.avatar_url ?? "",
  };
}

export async function getProfileShowcase(profileId: string): Promise<ProfileShowcaseData> {
  const supabase = await createClient();
  const fullCatalog = await listGiftCatalog();
  const catalog = fullCatalog.filter(giftHasAsset);
  const catalogById = new Map(fullCatalog.map((gift) => [gift.id, gift]));

  const [ownedResult, receivedResult, sentWithCostResult, sentAggregateWithCost, followerResult, followingResult, featuredResult] =
    await Promise.all([
      supabase.from("owned_gifts").select("gift_id,from_id").eq("owner_id", profileId).limit(10_000),
      supabase
        .from("owned_gifts")
        .select("id,gift_id,from_id,received_at")
        .eq("owner_id", profileId)
        .not("from_id", "is", null)
        .order("received_at", { ascending: false })
        .limit(HISTORY_LIMIT),
      supabase
        .from("owned_gifts")
        .select("id,owner_id,gift_id,received_at,credits_spent")
        .eq("from_id", profileId)
        .order("received_at", { ascending: false })
        .limit(HISTORY_LIMIT),
      supabase
        .from("owned_gifts")
        .select("gift_id,credits_spent")
        .eq("from_id", profileId)
        .limit(10_000),
      supabase.from("follows").select("follower_id", { count: "exact", head: true }).eq("following_id", profileId),
      supabase.from("follows").select("following_id", { count: "exact", head: true }).eq("follower_id", profileId),
      supabase
        .from("profile_featured_gifts")
        .select("gift_id,position")
        .eq("profile_id", profileId)
        .order("position", { ascending: true }),
    ]);

  // `credits_spent` and `profile_featured_gifts` arrive with migration 0022. Until it is
  // applied, the public profile still works against the current production schema.
  let sentRows: any[] = sentWithCostResult.data ?? [];
  if (sentWithCostResult.error) {
    const { data } = await supabase
      .from("owned_gifts")
      .select("id,owner_id,gift_id,received_at")
      .eq("from_id", profileId)
      .order("received_at", { ascending: false })
      .limit(HISTORY_LIMIT);
    sentRows = data ?? [];
  }
  let sentAggregateRows: any[] = sentAggregateWithCost.data ?? [];
  if (sentAggregateWithCost.error) {
    const { data } = await supabase
      .from("owned_gifts")
      .select("gift_id")
      .eq("from_id", profileId)
      .limit(10_000);
    sentAggregateRows = data ?? [];
  }

  const ownedRows = ownedResult.data ?? [];
  const receivedRows = receivedResult.data ?? [];
  const quantities = new Map<string, number>();
  for (const row of ownedRows) quantities.set(row.gift_id, (quantities.get(row.gift_id) ?? 0) + 1);

  const collection = catalog.map((gift) => ({
    gift,
    quantity: quantities.get(gift.id) ?? 0,
    unlocked: quantities.has(gift.id),
  }));

  const actorIds = Array.from(
    new Set([
      ...receivedRows.map((row: any) => row.from_id),
      ...sentRows.map((row: any) => row.owner_id),
    ].filter(Boolean)),
  );
  const actors = new Map<string, ProfileGiftActor>();
  if (actorIds.length) {
    const { data } = await supabase
      .from("profiles")
      .select("id,username,display_name,avatar_url")
      .in("id", actorIds);
    for (const row of data ?? []) actors.set(row.id, mapActor(row));
  }

  const received = receivedRows.flatMap((row: any): ProfileGiftHistoryItem[] => {
    const gift = catalogById.get(row.gift_id);
    if (!gift) return [];
    return [{
      id: row.id,
      gift,
      actor: row.from_id ? actors.get(row.from_id) : undefined,
      receivedAt: row.received_at,
      direction: "received",
    }];
  });

  const sent = sentRows.flatMap((row: any): ProfileGiftHistoryItem[] => {
    const gift = catalogById.get(row.gift_id);
    if (!gift) return [];
    return [{
      id: row.id,
      gift,
      actor: actors.get(row.owner_id),
      receivedAt: row.received_at,
      creditsSpent: Number(row.credits_spent ?? gift.price),
      direction: "sent",
    }];
  });

  const featuredIds = featuredResult.error
    ? []
    : (featuredResult.data ?? []).map((row: any) => row.gift_id as string);
  const featured = featuredIds.flatMap((giftId) => {
    const item = collection.find((candidate) => candidate.gift.id === giftId && candidate.unlocked);
    return item ? [item] : [];
  });

  const creditsSent = sentAggregateRows.reduce((sum, row) => {
    const gift = catalogById.get(row.gift_id);
    return sum + Number(row.credits_spent ?? gift?.price ?? 0);
  }, 0);
  const activity = [...received, ...sent]
    .sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime())
    .slice(0, 6);

  return {
    catalog,
    collection,
    featured,
    received,
    sent,
    activity,
    stats: {
      giftsReceived: ownedRows.filter((row: any) => row.from_id).length,
      giftsSent: sentAggregateRows.length,
      creditsSent,
      unlocked: quantities.size,
      catalogTotal: catalog.length,
      followers: followerResult.count ?? 0,
      following: followingResult.count ?? 0,
    },
  };
}
