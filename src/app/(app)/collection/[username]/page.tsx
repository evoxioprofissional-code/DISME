import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import type { Rarity } from "@/types";
import { getUserByUsername, getUser, getGift, getCollection } from "@/data";
import { rarityLabel } from "@/data/gifts";
import { serial as fmtSerial, timeAgo } from "@/lib/utils";
import { PageContainer } from "@/components/layout/AppShell";
import { GiftGlyph } from "@/components/gifts/GiftGlyph";
import { RarityTag } from "@/components/ui/RarityTag";
import { Avatar } from "@/components/ui/Avatar";

const RARE_SET: Rarity[] = ["epic", "legendary", "limited"];

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const user = getUserByUsername(username);
  if (!user) notFound();

  const collection = getCollection(user.id, 12);

  const byRarity = collection.reduce<Record<string, number>>((acc, og) => {
    const g = getGift(og.giftId)!;
    acc[g.rarity] = (acc[g.rarity] ?? 0) + 1;
    return acc;
  }, {});
  const rarityOrder: Rarity[] = ["limited", "legendary", "epic", "rare", "common"];

  return (
    <PageContainer className="max-w-4xl">
      <Link
        href={`/profile/${user.username}`}
        className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-text-secondary hover:text-text"
      >
        <ChevronLeft className="size-4" />
        {user.displayName}
      </Link>

      <div className="mb-5 flex items-center gap-3">
        <Avatar src={user.avatar} name={user.displayName} size="lg" />
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Coleção de {user.displayName}</h1>
          <p className="tnum text-sm text-text-secondary">{user.stats.collectionCount} presentes</p>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {rarityOrder
          .filter((r) => byRarity[r])
          .map((r) => (
            <span
              key={r}
              className="inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-3 py-1 text-xs font-semibold text-text-secondary"
            >
              <RarityTag rarity={r} />
              <span className="tnum">{byRarity[r]}</span>
            </span>
          ))}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {collection.map((og) => {
          const gift = getGift(og.giftId)!;
          const from = getUser(og.fromUserId);
          const rare = RARE_SET.includes(gift.rarity);
          return (
            <div
              key={og.id}
              className={
                "flex flex-col rounded-2xl border bg-surface p-3 " +
                (rare ? "border-border-strong" : "border-border")
              }
            >
              <GiftGlyph giftId={gift.id} rarity={gift.rarity} className="mb-3 aspect-square w-full" />
              <p className="truncate text-sm font-bold text-text">{gift.name}</p>
              <div className="mt-1"><RarityTag rarity={gift.rarity} /></div>
              {gift.supply && og.serial && (
                <p className="tnum mt-1.5 text-[11px] font-semibold text-muted">
                  {fmtSerial(og.serial, gift.supply)}
                </p>
              )}
              {from && (
                <p className="mt-2 flex items-center gap-1.5 border-t border-border pt-2 text-xs text-muted">
                  <Avatar src={from.avatar} name={from.displayName} size="xs" className="!size-5" />
                  <span className="truncate">de {from.displayName}</span>
                </p>
              )}
              <p className="mt-1 text-[11px] text-muted">{timeAgo(og.receivedAt)}</p>
            </div>
          );
        })}
      </div>
    </PageContainer>
  );
}
