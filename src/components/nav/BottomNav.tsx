"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { mobileNav, profileHref } from "@/lib/nav";
import { currentUser } from "@/data";
import { Avatar } from "@/components/ui/Avatar";

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

export function BottomNav() {
  const pathname = usePathname();
  const me = currentUser();
  const profile = profileHref();
  const profileActive = pathname.startsWith("/profile");

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 backdrop-blur lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto grid max-w-md grid-cols-5">
        {mobileNav.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className="relative flex flex-col items-center gap-1 py-2.5"
                aria-current={active ? "page" : undefined}
              >
                <span className="relative">
                  <Icon
                    className={cn("size-6", active ? "text-brand" : "text-muted")}
                    strokeWidth={active ? 2.5 : 2}
                  />
                  {!!item.badge && item.badge > 0 && (
                    <span className="absolute -right-2 -top-1.5 min-w-4 rounded-full bg-brand px-1 text-center text-[10px] font-bold leading-4 text-on-brand">
                      {item.badge}
                    </span>
                  )}
                </span>
                <span
                  className={cn(
                    "text-[10px] font-semibold",
                    active ? "text-text" : "text-muted",
                  )}
                >
                  {item.label}
                </span>
              </Link>
            </li>
          );
        })}
        <li>
          <Link
            href={profile}
            className="relative flex flex-col items-center gap-1 py-2.5"
            aria-current={profileActive ? "page" : undefined}
          >
            <span
              className={cn(
                "rounded-full",
                profileActive && "ring-2 ring-brand ring-offset-2 ring-offset-surface",
              )}
            >
              <Avatar src={me.avatar} name={me.displayName} size="xs" />
            </span>
            <span
              className={cn(
                "text-[10px] font-semibold",
                profileActive ? "text-text" : "text-muted",
              )}
            >
              Perfil
            </span>
          </Link>
        </li>
      </ul>
    </nav>
  );
}
