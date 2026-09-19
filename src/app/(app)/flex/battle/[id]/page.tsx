import { notFound } from "next/navigation";
import { Timer, ShieldCheck } from "lucide-react";
import { getBattle, getUser } from "@/data";
import { formatNumber, countdown } from "@/lib/utils";
import { PageContainer } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { Section } from "@/components/ui/Section";
import { Avatar } from "@/components/ui/Avatar";
import { CheerBar } from "@/components/flex/CheerBar";

const gainsA = [
  { label: "Recebeu Coroa", value: 700 },
  { label: "Presente enviado", value: 260 },
  { label: "Conquista desbloqueada", value: 400 },
];
const gainsB = [
  { label: "Recebeu Galáxia", value: 1400 },
  { label: "Coleção atualizada", value: 300 },
];

export default async function BattlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const battle = getBattle(id);
  if (!battle) notFound();

  const a = getUser(battle.userIds[0]);
  const b = getUser(battle.userIds[1]);
  if (!a || !b) notFound();

  const [sa, sb] = battle.scores;
  const total = sa + sb;
  const pct = Math.round((sa / total) * 100);

  return (
    <PageContainer>
      <div className="mb-5 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-muted">Batalha de Flex</p>
        <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-3 py-1.5 text-sm font-semibold text-text">
          <Timer className="size-4 text-brand" />
          Restam {countdown(battle.endsAt)}
        </div>
      </div>

      {/* Head to head */}
      <Card className="p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-1 flex-col items-center text-center">
            <Avatar src={a.avatar} name={a.displayName} size="2xl" presence={a.presence} />
            <p className="mt-2 font-bold text-text">{a.displayName}</p>
            <p className="tnum text-2xl font-extrabold text-brand">{formatNumber(sa)}</p>
          </div>
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface-2 text-xs font-extrabold uppercase tracking-widest text-muted">
            vs
          </span>
          <div className="flex flex-1 flex-col items-center text-center">
            <Avatar src={b.avatar} name={b.displayName} size="2xl" presence={b.presence} />
            <p className="mt-2 font-bold text-text">{b.displayName}</p>
            <p className="tnum text-2xl font-extrabold text-text">{formatNumber(sb)}</p>
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

      {/* Gains during the period */}
      <div className="mt-7 grid gap-6 sm:grid-cols-2">
        <Section title={`Flex de ${a.displayName}`}>
          <Card className="divide-y divide-border overflow-hidden">
            {gainsA.map((g, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-3">
                <span className="text-sm text-text-secondary">{g.label}</span>
                <span className="tnum text-sm font-bold text-success">+{formatNumber(g.value)}</span>
              </div>
            ))}
          </Card>
        </Section>
        <Section title={`Flex de ${b.displayName}`}>
          <Card className="divide-y divide-border overflow-hidden">
            {gainsB.map((g, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-3">
                <span className="text-sm text-text-secondary">{g.label}</span>
                <span className="tnum text-sm font-bold text-success">+{formatNumber(g.value)}</span>
              </div>
            ))}
          </Card>
        </Section>
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
