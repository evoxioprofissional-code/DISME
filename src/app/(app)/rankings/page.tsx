import { rankings } from "@/data";
import { PageContainer } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { RankingBoard } from "@/components/ranking/RankingBoard";

export default function RankingsPage() {
  return (
    <PageContainer>
      <PageHeader title="Ranking" subtitle="Os melhores da comunidade, atualizados toda semana" />
      <RankingBoard data={rankings} />
    </PageContainer>
  );
}
