import { ArrowUp, Gift, HandHeart, Trophy, Layers, Activity } from "lucide-react";
import { getMyProfile, listBattles, getFlexTop } from "@/lib/queries";
import { formatNumber } from "@/lib/utils";
import { PageContainer } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { Section } from "@/components/ui/Section";
import { EmptyState } from "@/components/ui/EmptyState";
import { Sparkline } from "@/components/flex/Sparkline";
import { BattleCard } from "@/components/flex/BattleCard";
import { MiniRanking } from "@/components/home/widgets";

export default async function FlexPage() {
  const me = (await getMyProfile())!;
  const [battles, flexTop] = await Promise.all([listBattles(), getFlexTop(10)]);
  const flex = me.stats.flex;

  const series = [0.9, 0.925, 0.945, 0.962, 0.978, 0.99, 1].map((f) => Math.round(flex * f));
  const weeklyGain = series[series.length - 1] - series[0];

  const breakdown = [
    { label: "Presentes recebidos", frac: 0.34, icon: Gift },
    { label: "Presentes enviados", frac: 0.4, icon: HandHeart },
    { label: "Coleção", frac: 0.11, icon: Layers },
    { label: "Conquistas", frac: 0.1, icon: Trophy },
    { label: "Atividade", frac: 0.05, icon: Activity },
  ].map((b) => ({ ...b, value: Math.round(flex * b.frac) }));
  const maxBd = Math.max(1, ...breakdown.map((b) => b.value));

  const myRank = flexTop.find((entry) => entry.user.id === me.id)?.rank;

  return (
    <PageContainer>
      <Card className="mb-6 overflow-hidden p-6">
        <p className="text-xs font-bold uppercase tracking-wide text-muted">Meu Flex</p>
        <p className="tnum mt-1 text-5xl font-extrabold leading-none text-brand">{formatNumber(flex)}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {myRank && (
            <span className="rounded-full bg-surface-2 px-2.5 py-1 text-xs font-semibold text-text">
              #{myRank} no ranking global
            </span>
          )}
          {weeklyGain > 0 && (
            <span className="flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-1 text-xs font-semibold text-success">
              <ArrowUp className="size-3" />
              {formatNumber(weeklyGain)} esta semana
            </span>
          )}
        </div>
        {flex > 0 && <Sparkline data={series} className="mt-5 h-14 w-full" />}
      </Card>

      {flex > 0 ? (
        <Section title="Como você ganha Flex">
          <Card className="divide-y divide-border overflow-hidden">
            {breakdown.map((b) => {
              const Icon = b.icon;
              return (
                <div key={b.label} className="flex items-center gap-3 px-4 py-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-brand">
                    <Icon className="size-[18px]" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-text">{b.label}</span>
                      <span className="tnum text-sm font-bold text-text">+{formatNumber(b.value)}</span>
                    </div>
                    <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-surface-3">
                      <div className="h-full rounded-full bg-brand/70" style={{ width: `${(b.value / maxBd) * 100}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </Card>
        </Section>
      ) : (
        <EmptyState
          title="Seu Flex começa agora"
          description="Envie e receba presentes, complete conquistas e suba no ranking para acumular Flex."
        />
      )}

      {battles[0] && (
        <div className="mt-7">
          <Section title="Batalha de Flex" action="Ver batalha" href={`/flex/battle/${battles[0].id}`}>
            <BattleCard battle={battles[0]} href={`/flex/battle/${battles[0].id}`} />
          </Section>
        </div>
      )}

      {flexTop.length > 0 && (
        <div className="mt-7">
          <MiniRanking entries={flexTop} />
        </div>
      )}
    </PageContainer>
  );
}
