import Link from "next/link";
import { Gift, HandHeart, Trophy, Layers, Activity, ArrowUp } from "lucide-react";
import { currentUser, battles, getUser } from "@/data";
import { formatNumber, formatCompact } from "@/lib/utils";
import { PageContainer } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { Section } from "@/components/ui/Section";
import { Avatar } from "@/components/ui/Avatar";
import { Sparkline } from "@/components/flex/Sparkline";
import { BattleCard } from "@/components/flex/BattleCard";
import { MiniRanking } from "@/components/home/widgets";

const FRIENDS = ["u2", "u10", "u5", "u6"];

export default function FlexPage() {
  const me = currentUser();
  const flex = me.stats.flex;

  // Deterministic weekly evolution ending at current Flex.
  const series = [0.9, 0.925, 0.945, 0.962, 0.978, 0.99, 1].map((f) => Math.round(flex * f));
  const weeklyGain = series[series.length - 1] - series[0];

  const breakdown = [
    { label: "Presentes recebidos", value: 8200, icon: Gift },
    { label: "Presentes enviados", value: 9800, icon: HandHeart },
    { label: "Coleção", value: 2600, icon: Layers },
    { label: "Conquistas", value: 2400, icon: Trophy },
    { label: "Atividade", value: 1180, icon: Activity },
  ];
  const maxBd = Math.max(...breakdown.map((b) => b.value));

  return (
    <PageContainer>
      {/* Hero */}
      <Card className="mb-6 overflow-hidden p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-muted">Meu Flex</p>
            <p className="tnum mt-1 text-5xl font-extrabold leading-none text-brand">
              {formatNumber(flex)}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-surface-2 px-2.5 py-1 text-xs font-semibold text-text">
                #{me.flexRank} no ranking global
              </span>
              <span className="flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-1 text-xs font-semibold text-success">
                <ArrowUp className="size-3" />
                {formatNumber(weeklyGain)} esta semana
              </span>
            </div>
          </div>
        </div>
        <Sparkline data={series} className="mt-5 h-14 w-full" />
      </Card>

      {/* Como ganha */}
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
                    <span className="tnum text-sm font-bold text-text">
                      +{formatNumber(b.value)}
                    </span>
                  </div>
                  <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-surface-3">
                    <div
                      className="h-full rounded-full bg-brand/70"
                      style={{ width: `${(b.value / maxBd) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </Card>
      </Section>

      {/* Batalha */}
      <div className="mt-7">
        <Section title="Batalha de Flex" action="Ver batalha" href={`/flex/battle/${battles[0].id}`}>
          <BattleCard battle={battles[0]} href={`/flex/battle/${battles[0].id}`} />
        </Section>
      </div>

      {/* Top Flex */}
      <div className="mt-7">
        <MiniRanking />
      </div>

      {/* Amigos */}
      <div className="mt-7">
        <Section title="Amigos" >
          <Card className="divide-y divide-border overflow-hidden">
            {FRIENDS.map((id) => {
              const u = getUser(id);
              if (!u) return null;
              return (
                <Link
                  key={id}
                  href={`/profile/${u.username}`}
                  className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-surface-2"
                >
                  <Avatar src={u.avatar} name={u.displayName} size="sm" presence={u.presence} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold text-text">{u.displayName}</span>
                    <span className="block truncate text-xs text-muted">#{u.flexRank} global</span>
                  </span>
                  <span className="tnum text-sm font-bold text-brand">{formatCompact(u.stats.flex)}</span>
                </Link>
              );
            })}
          </Card>
        </Section>
      </div>
    </PageContainer>
  );
}
