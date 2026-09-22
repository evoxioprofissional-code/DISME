import Link from "next/link";
import { ArrowRight, ChevronRight, Gift, Timer } from "lucide-react";
import type { User } from "@/types";
import type { BattleData } from "@/lib/queries";
import { formatNumber, formatCompact, countdown, cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { buttonClasses } from "@/components/ui/Button";

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
  return (
    <section>
      <RailTitle title="Top Flex da semana" href="/rankings" />
      {entries.length === 0 ? (
        <Card className="px-4 py-4 text-sm text-text-secondary">O ranking está começando a ganhar ritmo.</Card>
      ) : (
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
      )}
    </section>
  );
}

export function HomeIntro({ profiles }: { profiles: User[] }) {
  return (
    <section className="mb-6 overflow-hidden rounded-2xl border border-border bg-surface">
      <div className="grid min-h-[260px] items-center gap-6 px-5 py-6 sm:px-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:px-10">
        <div className="max-w-xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand">Sua próxima conversa pode estar aqui</p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-text sm:text-4xl">Encontre sua galera no DisMe</h2>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-text-secondary sm:text-base">
            Descubra pessoas, encontre perfis que combinam com você e veja quem está aparecendo pela comunidade.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/discover" className={buttonClasses({ size: "md" })}>
              Explorar pessoas <ArrowRight className="size-4" />
            </Link>
            <Link href="/profile/edit" className={buttonClasses({ variant: "outline", size: "md" })}>
              Completar meu perfil
            </Link>
          </div>
        </div>
        <div className="relative hidden h-44 lg:block" aria-label="Perfis demonstrativos da comunidade">
          {profiles.map((profile, index) => (
            <div key={profile.id} className="absolute" style={{ left: `${index * 48}px`, top: index % 2 === 0 ? "8px" : "54px", zIndex: profiles.length - index }}>
              <Avatar src={profile.avatar} name={profile.displayName} size={index === 0 ? "2xl" : "xl"} className="ring-8 ring-surface" presence={profile.presence} />
            </div>
          ))}
          <div className="absolute bottom-1 right-0 rounded-full border border-border bg-surface-2 px-3 py-1.5 text-xs font-semibold text-text-secondary">gente nova por aqui</div>
        </div>
      </div>
    </section>
  );
}

function ProfileCard({ profile }: { profile: User }) {
  return (
    <Link href={`/profile/${profile.username}`} className="block min-w-[150px] rounded-2xl border border-border bg-surface p-3 transition-colors hover:border-border-strong hover:bg-surface-2 sm:min-w-0">
      <Avatar src={profile.avatar} name={profile.displayName} size="2xl" presence={profile.presence} className="mx-auto" />
      <div className="mt-3 text-center">
        <h3 className="truncate text-sm font-bold text-text">{profile.displayName}</h3>
        <p className="truncate text-xs text-muted">@{profile.username}</p>
        <p className="mt-2 line-clamp-2 text-xs text-text-secondary">{profile.bio || "Conheça este perfil"}</p>
      </div>
    </Link>
  );
}

export function FeaturedProfiles({ users }: { users: User[] }) {
  return (
    <section>
      <div className="mb-3 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-lg font-extrabold text-text">Pessoas em destaque</h2>
          <p className="mt-1 text-sm text-text-secondary">Perfis para começar a explorar a comunidade.</p>
        </div>
        <Link href="/discover" className="inline-flex items-center gap-1 text-xs font-bold text-brand hover:underline">Ver todas <ChevronRight className="size-3.5" /></Link>
      </div>
      <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-4 sm:overflow-visible sm:px-0 lg:grid-cols-4">
        {users.map((user) => <ProfileCard key={user.id} profile={user} />)}
      </div>
      {users.length === 0 && <Card className="px-4 py-4 text-sm text-text-secondary">Novos perfis aparecerão aqui conforme a comunidade crescer.</Card>}
    </section>
  );
}

export function TrendingRail({ users }: { users: User[] }) {
  return (
    <section>
      <RailTitle title="Em alta" href="/discover" />
      <Card className="divide-y divide-border">
        {users.map((user) => (
          <Link href={`/profile/${user.username}`} key={user.id} className="flex items-center gap-3 px-3 py-3 transition-colors hover:bg-surface-2">
            <Avatar src={user.avatar} name={user.displayName} size="sm" presence={user.presence} />
            <span className="min-w-0 flex-1"><span className="block truncate text-sm font-bold text-text">{user.displayName}</span><span className="block truncate text-xs text-muted">@{user.username}</span></span>
            <ChevronRight className="size-4 text-muted" />
          </Link>
        ))}
      </Card>
      {users.length === 0 && <Card className="px-3 py-3 text-xs text-text-secondary">Em alta aparecerá aqui quando houver perfis ativos.</Card>}
    </section>
  );
}

export function GiftPrompt() {
  return (
    <section className="rounded-2xl border border-border bg-surface p-4">
      <div className="flex items-start gap-3"><span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-tint text-brand"><Gift className="size-4" /></span><div><h2 className="text-sm font-bold text-text">Envie um presente</h2><p className="mt-1 text-xs leading-relaxed text-text-secondary">Surpreenda alguém que chamou sua atenção.</p></div></div>
      <Link href="/gifts" className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-brand hover:underline">Ver presentes <ChevronRight className="size-3.5" /></Link>
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
