import Link from "next/link";
import { Bell, ScanSearch, LogIn } from "lucide-react";
import { formatCompact } from "@/lib/utils";
import { type NavUser, type NavBadges } from "@/lib/nav";
import { Wordmark } from "@/components/brand/Wordmark";

/** Mobile-only top bar. Desktop uses the sidebar instead. */
export function TopBar({ me, badges }: { me: NavUser | null; badges: NavBadges }) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-bg/90 px-4 backdrop-blur lg:hidden">
      <Link href="/home" aria-label="DisMe — Início" className="flex items-center">
        <Wordmark priority className="!h-6" />
      </Link>
      <div className="flex items-center gap-2">
        <Link
          href="/discord"
          aria-label="Consultar usuário do Discord"
          className="flex size-9 items-center justify-center rounded-full bg-surface-2 text-text-secondary transition-colors hover:text-text"
        >
          <ScanSearch className="size-[18px]" />
        </Link>
        {me ? (
          <>
            <Link href="/flex" className="flex items-center gap-1.5 rounded-full bg-surface-2 px-3 py-1.5">
              <span className="tnum text-sm font-bold text-brand">{formatCompact(me.flex)}</span>
              <span className="text-[10px] font-semibold uppercase tracking-wide text-muted">Flex</span>
            </Link>
            <Link
              href="/notifications"
              aria-label="Notificações"
              className="relative flex size-9 items-center justify-center rounded-full bg-surface-2 text-text-secondary"
            >
              <Bell className="size-[18px]" />
              {badges.notifs > 0 && (
                <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-danger ring-2 ring-surface-2" />
              )}
            </Link>
          </>
        ) : (
          <Link
            href="/login"
            className="flex h-9 items-center gap-1.5 rounded-full bg-brand px-3.5 text-sm font-bold text-on-brand"
          >
            <LogIn className="size-4" />
            Entrar
          </Link>
        )}
      </div>
    </header>
  );
}
