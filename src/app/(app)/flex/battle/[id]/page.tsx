import { notFound } from "next/navigation";
import { Timer, ShieldCheck } from "lucide-react";
import { getBattleById } from "@/lib/queries";
import { formatNumber, countdown } from "@/lib/utils";
import { PageContainer } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { CheerBar } from "@/components/flex/CheerBar";

export default async function BattlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const battle = await getBattleById(id);
  if (!battle) notFound();

  const { a, b, scoreA, scoreB } = battle;
  const total = scoreA + scoreB || 1;
  const pct = Math.round((scoreA / total) * 100);

  return (
    <PageContainer>
      <div className="mb-5 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-muted">Batalha de Flex</p>
        <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-3 py-1.5 text-sm font-semibold text-text">
          <Timer className="size-4 text-brand" />
          Restam {countdown(battle.endsAt)}
        </div>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-1 flex-col items-center text-center">
            <Avatar src={a.avatar} name={a.displayName} size="2xl" presence={a.presence} />
            <p className="mt-2 font-bold text-text">{a.displayName}</p>
            <p className="tnum text-2xl font-extrabold text-brand">{formatNumber(scoreA)}</p>
          </div>
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface-2 text-xs font-extrabold uppercase tracking-widest text-muted">vs</span>
          <div className="flex flex-1 flex-col items-center text-center">
            <Avatar src={b.avatar} name={b.displayName} size="2xl" presence={b.presence} />
            <p className="mt-2 font-bold text-text">{b.displayName}</p>
            <p className="tnum text-2xl font-extrabold text-text">{formatNumber(scoreB)}</p>
          </div>
        </div>

        <div className="mt-5 flex h-2.5 overflow-hidden rounded-full bg-surface-3">
          <div className="h-full bg-brand" style={{ width: `${pct}%` }} />
          <div className="h-full flex-1 bg-border-strong" />
        </div>
        <div className="mt-1.5 flex justify-between text-xs font-semibold text-text-secondary">
          <span className="tnum">{pct}%</span>
          <span className="tnum">{100 - pct}%</span>
        </div>
      </Card>

      <div className="mt-4">
        <CheerBar nameA={a.displayName} nameB={b.displayName} />
      </div>

      <div className="mt-6 flex items-start gap-2.5 rounded-2xl border border-border bg-surface/60 px-4 py-3.5 text-sm text-text-secondary">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-muted" />
        <p>
          A batalha compara o Flex conquistado no período. É uma disputa social — sem apostas,
          sem prêmios e sem saque.
        </p>
      </div>
    </PageContainer>
  );
}
