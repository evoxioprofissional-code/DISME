"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings, Bell, LogIn } from "lucide-react";
import { cn, formatCompact } from "@/lib/utils";
import { primaryNav, type NavUser, type NavBadges } from "@/lib/nav";
import { Wordmark } from "@/components/brand/Wordmark";
import { Avatar } from "@/components/ui/Avatar";

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

export function Sidebar({ me, badges }: { me: NavUser | null; badges: NavBadges }) {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-dvh w-[248px] shrink-0 flex-col border-r border-border bg-surface px-3 py-5 lg:flex xl:w-[264px]">
      <Link href="/home" className="mb-6 flex items-center px-3" aria-label="DisMe — Início">
        <Wordmark priority className="-my-5 !h-20" />
      </Link>

      <nav className="flex flex-1 flex-col gap-1">
        {primaryNav.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;
          const badge = item.badgeKey ? badges[item.badgeKey] : 0;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-semibold transition-colors",
                active
                  ? "bg-surface-3 text-text"
                  : "text-text-secondary hover:bg-surface-2 hover:text-text",
              )}
            >
              {active && (
                <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-brand" />
              )}
              <Icon className={cn("size-[22px] shrink-0", active ? "text-brand" : "")} strokeWidth={active ? 2.4 : 2} />
              <span className="flex-1">{item.label}</span>
              {!!badge && badge > 0 && (
                <span className="min-w-5 rounded-full bg-brand px-1.5 text-center text-[11px] font-bold leading-5 text-on-brand">
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-2 flex flex-col gap-1 border-t border-border pt-3">
        <Link
          href="/notifications"
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
            isActive(pathname, "/notifications")
              ? "bg-surface-3 text-text"
              : "text-text-secondary hover:bg-surface-2 hover:text-text",
          )}
        >
          <span className="relative">
            <Bell className="size-[22px]" strokeWidth={2} />
            {badges.notifs > 0 && (
              <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full bg-danger ring-2 ring-surface" />
            )}
          </span>
          Notificações
        </Link>
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
            isActive(pathname, "/settings")
              ? "bg-surface-3 text-text"
              : "text-text-secondary hover:bg-surface-2 hover:text-text",
          )}
        >
          <Settings className="size-[22px]" strokeWidth={2} />
          Configurações
        </Link>

        {me ? (
          <Link
            href={`/profile/${me.username}`}
            className="mt-1 flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-surface-2"
          >
            <Avatar src={me.avatar} name={me.displayName} size="md" presence={me.presence} />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-bold text-text">{me.displayName}</span>
              <span className="block truncate text-xs text-muted">@{me.username}</span>
            </span>
            <span className="flex flex-col items-end">
              <span className="tnum text-sm font-bold text-brand">{formatCompact(me.flex)}</span>
              <span className="text-[10px] font-semibold uppercase tracking-wide text-muted">Flex</span>
            </span>
          </Link>
        ) : (
          <Link
            href="/login"
            className="mt-1 flex h-11 items-center justify-center gap-2 rounded-full bg-brand text-sm font-bold text-on-brand transition-colors hover:bg-brand-hover"
          >
            <LogIn className="size-4" />
            Entrar
          </Link>
        )}
      </div>
    </aside>
  );
}
