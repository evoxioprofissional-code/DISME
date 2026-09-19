import { listFeed, listSuggestions, listBattles, getFlexTop, getSessionUserId } from "@/lib/queries";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { FeedItem } from "@/components/feed/FeedItem";
import { MiniRanking, BattleTeaser, SuggestionsRail } from "@/components/home/widgets";

export default async function HomePage() {
  const meId = await getSessionUserId();
  const [feed, suggestions, battles, flexTop] = await Promise.all([
    listFeed(),
    listSuggestions(meId),
    listBattles(),
    getFlexTop(5),
  ]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6 lg:py-8">
      <PageHeader title="Início" subtitle="O que está rolando no DisMe agora" />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-6">
          <div className="lg:hidden">
            <SuggestionsRail users={suggestions} />
          </div>

          {feed.length > 0 ? (
            <Card className="divide-y divide-border overflow-hidden">
              {feed.map((item) => (
                <FeedItem key={item.activity.id} item={item} />
              ))}
            </Card>
          ) : (
            <EmptyState
              title="O feed está começando"
              description="Conforme as pessoas se conectam, os matches, presentes e conquistas aparecem aqui."
            />
          )}

          <div className="space-y-6 lg:hidden">
            <BattleTeaser battle={battles[0]} />
            <MiniRanking entries={flexTop} />
          </div>
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-6 space-y-6">
            <MiniRanking entries={flexTop} />
            <BattleTeaser battle={battles[0]} />
            <SuggestionsRail users={suggestions} />
          </div>
        </aside>
      </div>
    </div>
  );
}
