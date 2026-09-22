import { listFeed, listSuggestions, listBattles, getFlexTop, getSessionUserId } from "@/lib/queries";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { FeedItem } from "@/components/feed/FeedItem";
import { MiniRanking, BattleTeaser, HomeIntro, SuggestionsRail, FeaturedProfiles, TrendingRail, GiftPrompt } from "@/components/home/widgets";

const developmentUsernames = new Set(["ratonet", "asdasd", "money", "matheus", "assbarbosa83"]);

function isHomeUserVisible(user: { username: string; displayName: string }) {
  return !developmentUsernames.has(user.username.trim().toLowerCase()) && !developmentUsernames.has(user.displayName.trim().toLowerCase());
}

export default async function HomePage() {
  const meId = await getSessionUserId();
  const [feed, suggestions, battles, flexTop] = await Promise.all([
    listFeed(),
    listSuggestions(meId, 20),
    listBattles(),
    getFlexTop(5),
  ]);
  const visibleSuggestions = suggestions.filter(isHomeUserVisible);
  const visibleFlexTop = flexTop.filter((entry) => isHomeUserVisible(entry.user) && entry.value > 0);
  const visibleBattle = battles.find((battle) => isHomeUserVisible(battle.a) && isHomeUserVisible(battle.b));

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6 lg:py-8">
      <PageHeader title="Início" subtitle="O que está rolando no DisMe agora" />

      <HomeIntro profiles={visibleSuggestions.slice(0, 4)} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-6">
          <div className="lg:hidden">
            <SuggestionsRail users={visibleSuggestions} />
          </div>

          {feed.length > 0 ? (
            <Card className="divide-y divide-border overflow-hidden">
              {feed.map((item) => (
                <FeedItem key={item.activity.id} item={item} />
              ))}
            </Card>
          ) : (
            <EmptyState
              title="Seu feed ainda está tranquilo"
              description="Enquanto a comunidade cresce, descubra pessoas e encontre novas conversas."
            />
          )}

          <FeaturedProfiles users={visibleSuggestions.slice(0, 8)} />

          <div className="space-y-6 lg:hidden">
            <BattleTeaser battle={visibleBattle} />
            <MiniRanking entries={visibleFlexTop} />
          </div>
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-6 space-y-6">
            <MiniRanking entries={visibleFlexTop} />
            <TrendingRail users={visibleSuggestions.slice(0, 3)} />
            <GiftPrompt />
            <BattleTeaser battle={visibleBattle} />
          </div>
        </aside>
      </div>
    </div>
  );
}
