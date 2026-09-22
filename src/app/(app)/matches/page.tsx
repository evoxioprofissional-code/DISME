import Image from "next/image";
import Link from "next/link";
import { timeAgo } from "@/lib/utils";
import { PageContainer } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { CrushIcon } from "@/components/icons/Crush";
import { buttonClasses } from "@/components/ui/Button";
import { LoginCta } from "@/components/auth/LoginCta";
import { listMatches, getSessionUserId, type MatchData } from "@/lib/queries";
import { StartConversationButton } from "@/components/messages/StartConversationButton";

function MatchCard({ match }: { match: MatchData }) {
  const u = match.user;
  return (
    <div className="group overflow-hidden rounded-2xl border border-border bg-surface">
      <Link href={`/profile/${u.username}`} className="relative block aspect-[3/4]">
        <Image
          src={u.avatar}
          alt={u.displayName}
          fill
          sizes="(min-width:1024px) 240px, 45vw"
          className="object-cover"
        />
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/85 to-transparent" />
        {match.viaCrush && (
          <span
            className={
              "absolute left-2 top-2 flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-bold " +
              "bg-rarity-limited/90 text-white"
            }
          >
            <CrushIcon className="size-3" />
            Crush
          </span>
        )}
        <div className="absolute inset-x-0 bottom-0 p-3">
          <p className="flex items-center gap-1.5 text-[15px] font-extrabold text-white">
            {u.displayName}
            <span className="font-semibold text-white/80">{u.age}</span>
          </p>
          <p className="text-xs text-white/70">Match {timeAgo(match.matchedAt)}</p>
        </div>
      </Link>
      <div className="p-2">
        <StartConversationButton
          otherId={u.id}
          className={buttonClasses({ variant: "secondary", size: "sm", className: "w-full" })}
        />
      </div>
    </div>
  );
}

export default async function MatchesPage() {
  const meId = await getSessionUserId();
  if (!meId) {
    return (
      <PageContainer className="max-w-4xl">
        <PageHeader title="Matches" subtitle="Quem também curtiu você" />
        <LoginCta
          title="Entre para ver seus matches"
          description="Curta pessoas em Descobrir e, quando rolar match, ele aparece aqui."
        />
      </PageContainer>
    );
  }
  const matches = await listMatches(meId);
  const news = matches.slice(0, 4);
  const newIds = new Set(news.map((m) => m.id));
  const rest = matches.filter((m) => !newIds.has(m.id));

  return (
    <PageContainer className="max-w-4xl">
      <PageHeader title="Matches" subtitle="Quem também curtiu você" />

      {matches.length === 0 ? (
        <EmptyState
          title="Ainda sem matches"
          description="Curta pessoas em Descobrir para começar a conversar."
          action={
            <Link href="/discover" className={buttonClasses({ size: "sm" })}>
              Ir para Descobrir
            </Link>
          }
        />
      ) : (
        <div className="space-y-8">
          {news.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted">
                Novos matches
              </h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {news.map((m) => (
                  <MatchCard key={m.id} match={m} />
                ))}
              </div>
            </section>
          )}
          {rest.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted">
                Todos os matches
              </h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {rest.map((m) => (
                  <MatchCard key={m.id} match={m} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </PageContainer>
  );
}
