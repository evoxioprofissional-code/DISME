import Link from "next/link";
import { Timer, ChevronRight } from "lucide-react";
import type { FlexBattle } from "@/types";
import { getUser } from "@/data";
import { cn, formatNumber, countdown } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";

export function BattleCard({
  battle,
  href,
  className,
}: {
  battle: FlexBattle;
  href?: string;
  className?: string;
}) {
  const a = getUser(battle.userIds[0]);
  const b = getUser(battle.userIds[1]);
  if (!a || !b) return null;
  const [sa, sb] = battle.scores;
  const total = sa + sb;
  const pct = Math.round((sa / total) * 100);
  const leadingA = sa >= sb;

  const inner = (
    <Card interactive={!!href} className="p-5">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <Avatar src={a.avatar} name={a.displayName} size="lg" />
          <div>
            <p className="font-bold text-text">{a.displayName}</p>
            <p className={cn("tnum text-sm font-semibold", leadingA ? "text-brand" : "text-text-secondary")}>
              {formatNumber(sa)}
            </p>
          </div>
        </div>
        <span className="mt-3 text-xs font-extrabold uppercase tracking-widest text-muted">vs</span>
        <div className="flex items-center gap-2.5 text-right">
          <div>
            <p className="font-bold text-text">{b.displayName}</p>
            <p className={cn("tnum text-sm font-semibold", !leadingA ? "text-brand" : "text-text-secondary")}>
              {formatNumber(sb)}
            </p>
          </div>
          <Avatar src={b.avatar} name={b.displayName} size="lg" />
        </div>
      </div>

      <div className="mt-4 flex h-2 overflow-hidden rounded-full bg-surface-3">
        <div className="h-full rounded-l-full bg-brand" style={{ width: `${pct}%` }} />
        <div className="h-full flex-1 rounded-r-full bg-border-strong" />
      </div>

      <div className="mt-3 flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 text-text-secondary">
          <Timer className="size-3.5" />
          Restam {countdown(battle.endsAt)}
        </span>
        {href && (
          <span className="flex items-center gap-0.5 font-semibold text-brand">
            Detalhes <ChevronRight className="size-3.5" />
          </span>
        )}
      </div>
    </Card>
  );

  if (href) {
    return (
      <Link href={href} className={cn("block", className)}>
        {inner}
      </Link>
    );
  }
  return <div className={className}>{inner}</div>;
}
