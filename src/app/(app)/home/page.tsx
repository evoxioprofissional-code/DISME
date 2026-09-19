import { feed } from "@/data";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { FeedItem } from "@/components/feed/FeedItem";
import { MiniRanking, BattleTeaser, SuggestionsRail } from "@/components/home/widgets";

const suggestions = ["u6", "u11", "u13", "u7", "u16"];

export default function HomePage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6 lg:py-8">
      <PageHeader title="Início" subtitle="O que está rolando no DisMe agora" />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-6">
          {/* mobile-only suggestions strip */}
          <div className="lg:hidden">
            <SuggestionsRail userIds={suggestions} />
          </div>

          <Card className="divide-y divide-border overflow-hidden">
            {feed.map((activity) => (
              <FeedItem key={activity.id} activity={activity} />
            ))}
          </Card>

          {/* mobile-only rail widgets below the feed */}
          <div className="space-y-6 lg:hidden">
            <BattleTeaser />
            <MiniRanking />
          </div>
        </div>

        {/* desktop right rail */}
        <aside className="hidden lg:block">
          <div className="sticky top-6 space-y-6">
            <MiniRanking />
            <BattleTeaser />
            <SuggestionsRail userIds={suggestions} />
          </div>
        </aside>
      </div>
    </div>
  );
}
