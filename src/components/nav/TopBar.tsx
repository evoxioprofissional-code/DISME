import Link from "next/link";
import { Bell } from "lucide-react";
import { formatCompact } from "@/lib/utils";
import { currentUser, notifications } from "@/data";
import { Wordmark } from "@/components/brand/Wordmark";

/** Mobile-only top bar. Desktop uses the sidebar instead. */
export function TopBar() {
  const me = currentUser();
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-bg/90 px-4 backdrop-blur lg:hidden">
      <Link href="/home" aria-label="DisMe — Início" className="flex items-center">
        <Wordmark priority className="!h-6" />
      </Link>
      <div className="flex items-center gap-2">
        <Link
          href="/flex"
          className="flex items-center gap-1.5 rounded-full bg-surface-2 px-3 py-1.5"
        >
          <span className="tnum text-sm font-bold text-brand">
            {formatCompact(me.stats.flex)}
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wide text-muted">
            Flex
          </span>
        </Link>
        <Link
          href="/notifications"
          aria-label="Notificações"
          className="relative flex size-9 items-center justify-center rounded-full bg-surface-2 text-text-secondary"
        >
          <Bell className="size-[18px]" />
          {unread > 0 && (
            <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-danger ring-2 ring-surface-2" />
          )}
        </Link>
      </div>
    </header>
  );
}
