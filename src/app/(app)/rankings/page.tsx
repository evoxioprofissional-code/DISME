import { getRankings } from "@/lib/queries";
import { PageContainer } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { RankingBoard } from "@/components/ranking/RankingBoard";
import type { RankEntry } from "@/components/ranking/parts";
import type { RankingCategory } from "@/types";

export default async function RankingsPage() {
  const data = (await getRankings()) as Record<RankingCategory, RankEntry[]>;
  return (
    <PageContainer>
      <PageHeader title="Ranking" subtitle="Os melhores da comunidade, atualizados toda semana" />
      <RankingBoard data={data} />
    </PageContainer>
  );
}
