import type { OwnedGift } from "@/types";
import { gifts } from "./gifts";
import { users } from "./users";

// Deterministic PRNG so a user's collection is stable across renders.
function seeded(seedStr: string) {
  let h = 1779033703 ^ seedStr.length;
  for (let i = 0; i < seedStr.length; i++) {
    h = Math.imul(h ^ seedStr.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

const cache = new Map<string, OwnedGift[]>();

/** A stable, mock collection for a user (up to `max` items, rarest first). */
export function getCollection(userId: string, max = 12): OwnedGift[] {
  const key = `${userId}:${max}`;
  const cached = cache.get(key);
  if (cached) return cached;

  const rng = seeded(userId);
  const others = users.filter((u) => u.id !== userId);
  const owned: OwnedGift[] = [];

  const count = Math.min(max, gifts.length);
  const pool = [...gifts];
  for (let i = 0; i < count; i++) {
    const gift = pool[Math.floor(rng() * pool.length)];
    const from = others[Math.floor(rng() * others.length)];
    const daysAgo = Math.floor(rng() * 200) + 1;
    owned.push({
      id: `${userId}-og-${i}`,
      giftId: gift.id,
      fromUserId: from.id,
      receivedAt: new Date(Date.now() - daysAgo * 86_400_000).toISOString(),
      serial: gift.supply ? Math.floor(rng() * gift.supply) + 1 : undefined,
    });
  }

  const rarityOrder = { limited: 0, legendary: 1, epic: 2, rare: 3, common: 4 };
  owned.sort((a, b) => {
    const ga = gifts.find((g) => g.id === a.giftId)!;
    const gb = gifts.find((g) => g.id === b.giftId)!;
    return rarityOrder[ga.rarity] - rarityOrder[gb.rarity];
  });

  cache.set(key, owned);
  return owned;
}
