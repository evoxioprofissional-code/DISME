import Link from "next/link";
import { notFound } from "next/navigation";
import { getCouple, getUser, getGame, getGift, getCollection } from "@/data";
import { relationshipMeta } from "@/lib/labels";
import { longDate, pluralDays, formatNumber } from "@/lib/utils";
import { PageContainer } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { Section } from "@/components/ui/Section";
import { Avatar } from "@/components/ui/Avatar";
import { GiftGlyph } from "@/components/gifts/GiftGlyph";
import { StreakCard, PetCard, CoupleTimeline, AchievementGrid } from "@/components/couple/parts";
import { CoupleRoom } from "@/components/couple/CoupleRoom";

export default async function CouplePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const couple = getCouple(id);
  if (!couple) notFound();
  const a = getUser(couple.userIds[0]);
  const b = getUser(couple.userIds[1]);
  if (!a || !b) notFound();

  const unlocked = couple.achievements.filter((x) => x.unlockedAt).length;
  const collection = [
    ...getCollection(a.id, 4),
    ...getCollection(b.id, 4),
  ].slice(0, 8);

  const stats = [
    { label: "Juntos há", value: pluralDays(couple.streakDays) },
    { label: "Presentes trocados", value: formatNumber(couple.giftsExchanged) },
    { label: "Conquistas", value: `${unlocked}/${couple.achievements.length}` },
    { label: "Jogos juntos", value: String(couple.sharedGames.length) },
  ];

  return (
    <PageContainer className="max-w-4xl">
      {/* Header */}
      <Card className="mb-5 p-6 text-center">
        <div className="flex items-center justify-center">
          <Avatar src={a.avatar} name={a.displayName} size="2xl" className="ring-4 ring-surface" />
          <Avatar src={b.avatar} name={b.displayName} size="2xl" className="-ml-6 ring-4 ring-surface" />
        </div>
        <h1 className="mt-4 text-2xl font-extrabold tracking-tight">
          <Link href={`/profile/${a.username}`} className="hover:text-brand">{a.displayName}</Link>
          <span className="text-brand"> + </span>
          <Link href={`/profile/${b.username}`} className="hover:text-brand">{b.displayName}</Link>
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          {relationshipMeta[couple.type]} · desde {longDate(couple.since)}
        </p>
        <p className="mt-3 inline-flex items-center rounded-full bg-brand-tint px-3 py-1 text-sm font-bold text-brand">
          Juntos há {pluralDays(couple.streakDays)}
        </p>
      </Card>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="p-4">
            <p className="text-lg font-extrabold text-text">{s.value}</p>
            <p className="text-xs text-muted">{s.label}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-7">
          <Section title="Nosso Espaço">
            <CoupleRoom petName={couple.pet?.name} />
          </Section>

          <Section title="História do casal">
            <CoupleTimeline couple={couple} />
          </Section>

          <Section title="Coleção do casal">
            <div className="grid grid-cols-4 gap-3 sm:grid-cols-8 lg:grid-cols-8">
              {collection.map((og, i) => {
                const gift = getGift(og.giftId)!;
                return (
                  <GiftGlyph
                    key={`${og.id}-${i}`}
                    giftId={gift.id}
                    rarity={gift.rarity}
                    className="aspect-square w-full"
                  />
                );
              })}
            </div>
          </Section>
        </div>

        <aside className="space-y-4">
          <StreakCard days={couple.streakDays} />
          {couple.pet && <PetCard pet={couple.pet} />}

          <div>
            <h2 className="mb-3 text-base font-bold text-text">Conquistas</h2>
            <AchievementGrid items={couple.achievements} />
          </div>

          <div>
            <h2 className="mb-3 text-base font-bold text-text">Jogos favoritos</h2>
            <div className="flex flex-wrap gap-2">
              {couple.sharedGames.map((g) => (
                <span
                  key={g}
                  className="rounded-full bg-surface-2 px-3 py-1.5 text-sm font-medium text-text"
                >
                  {getGame(g)?.name ?? g}
                </span>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </PageContainer>
  );
}
