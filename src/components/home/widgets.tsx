import Link from "next/link";
import { ChevronRight, Timer } from "lucide-react";
import type { User } from "@/types";
import type { BattleData } from "@/lib/queries";
import { formatNumber, formatCompact, countdown, cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";

function RailTitle({ title, href }: { title: string; href: string }) {
  return (
    <div className="mb-2 flex items-center justify-between px-1">
      <h2 className="text-[13px] font-bold uppercase tracking-wide text-muted">{title}</h2>
      <Link href={href} className="text-xs font-semibold text-brand hover:underline">
        Ver tudo
      </Link>
    </div>
  );
}

export function MiniRanking({ entries }: { entries: { rank: number; user: User; value: number }[] }) {
  if (entries.length === 0) return null;
  return (
    <section>
      <RailTitle title="Top Flex da semana" href="/rankings" />
      <Card className="divide-y divide-border">
        {entries.slice(0, 5).map((e) => (
          <Link
            key={e.rank}
            href={`/profile/${e.user.username}`}
            className="flex items-center gap-3 px-3 py-2.5 transition-colors first:rounded-t-2xl last:rounded-b-2xl hover:bg-surface-2"
          >
            <span
              className={cn(
                "tnum w-5 text-center text-sm font-extrabold",
                e.rank === 1 ? "text-gold" : e.rank <= 3 ? "text-text" : "text-muted",
              )}
            >
              {e.rank}
            </span>
            <Avatar src={e.user.avatar} name={e.user.displayName} size="sm" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-bold text-text">{e.user.displayName}</span>
              <span className="block truncate text-xs text-muted">@{e.user.username}</span>
            </span>
            <span className="tnum text-sm font-bold text-brand">{formatCompact(e.value)}</span>
          </Link>
        ))}
      </Card>
    </section>
  );
}

export function BattleTeaser({ battle }: { battle?: BattleData }) {
  if (!battle) return null;
  const { a, b, scoreA, scoreB } = battle;
  const total = scoreA + scoreB || 1;
  const pct = Math.round((scoreA / total) * 100);
  return (
    <section>
      <RailTitle title="Batalha de Flex" href={`/flex/battle/${battle.id}`} />
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar src={a.avatar} name={a.displayName} size="sm" />
            <div>
              <p className="text-sm font-bold text-text">{a.displayName}</p>
              <p className="tnum text-xs text-text-secondary">{formatNumber(scoreA)}</p>
            </div>
          </div>
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-muted">vs</span>
          <div className="flex items-center gap-2 text-right">
            <div>
              <p className="text-sm font-bold text-text">{b.displayName}</p>
              <p className="tnum text-xs text-text-secondary">{formatNumber(scoreB)}</p>
            </div>
            <Avatar src={b.avatar} name={b.displayName} size="sm" />
          </div>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-3">
          <div className="h-full rounded-full bg-brand" style={{ width: `${pct}%` }} />
        </div>
        <div className="mt-2 flex items-center justify-center gap-1.5 text-xs text-muted">
          <Timer className="size-3.5" />
          Restam {countdown(battle.endsAt)}
        </div>
      </Card>
    </section>
  );
}

export function SuggestionPeek({ user }: { user: User }) {
  return (
    <Link
      href={`/profile/${user.username}`}
      className="flex w-[150px] shrink-0 flex-col items-center gap-2 rounded-2xl border border-border bg-surface p-4 text-center transition-colors hover:border-border-strong hover:bg-surface-2 sm:w-full sm:flex-row sm:text-left"
    >
      <Avatar src={user.avatar} name={user.displayName} size="lg" presence={user.presence} />
      <span className="min-w-0">
        <span className="block truncate text-sm font-bold text-text">{user.displayName}</span>
        <span className="block truncate text-xs text-muted">@{user.username}</span>
        <span className="mt-1 flex items-center justify-center gap-1 text-xs font-semibold text-brand sm:justify-start">
          Ver perfil <ChevronRight className="size-3.5" />
        </span>
      </span>
    </Link>
  );
}

export function SuggestionsRail({ users }: { users: User[] }) {
  if (users.length === 0) return null;
  return (
    <section>
      <RailTitle title="Pessoas para conhecer" href="/discover" />
      <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 sm:mx-0 sm:flex-col sm:overflow-visible sm:px-0">
        {users.map((u) => (
          <SuggestionPeek key={u.id} user={u} />
        ))}
      </div>
    </section>
  );
}
