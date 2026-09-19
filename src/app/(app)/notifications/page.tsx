import Link from "next/link";
import { Zap, Gift, TrendingUp, HeartHandshake, MessageCircle, Layers } from "lucide-react";
import type { AppNotification } from "@/types";
import { notifications, getUser, getGift, currentUser } from "@/data";
import { timeAgo, cn } from "@/lib/utils";
import { PageContainer } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { CrushIcon } from "@/components/icons/Crush";

const typeIcon = {
  match: Zap,
  gift: Gift,
  crush: HeartHandshake,
  milestone: Layers,
  ranking: TrendingUp,
  relationship: HeartHandshake,
  message: MessageCircle,
} as const;

function render(n: AppNotification): { text: React.ReactNode; href: string } {
  const actor = n.actorId ? getUser(n.actorId) : undefined;
  const gift = n.giftId ? getGift(n.giftId) : undefined;
  const name = actor ? <span className="font-bold text-text">{actor.displayName}</span> : null;
  const profileHref = actor ? `/profile/${actor.username}` : "/home";

  switch (n.type) {
    case "match":
      return { text: <>{name} deu match com você.</>, href: "/matches" };
    case "gift":
      return {
        text: (
          <>
            {name} te enviou <span className="font-semibold text-text">{gift?.name}</span>.
          </>
        ),
        href: profileHref,
      };
    case "crush":
      return { text: <>{name} adicionou você como Crush.</>, href: profileHref };
    case "milestone":
      return n.meta?.collection
        ? {
            text: <>Sua coleção chegou a {String(n.meta.collection)} presentes.</>,
            href: `/collection/${currentUser().username}`,
          }
        : {
            text: <>Seu relacionamento completou {String(n.meta?.days)} dias.</>,
            href: "/couples",
          };
    case "ranking":
      return {
        text: (
          <>
            Você subiu para #{String(n.meta?.rank)} no ranking de {String(n.meta?.board)}.
          </>
        ),
        href: "/rankings",
      };
    case "relationship":
      return { text: <>{name} pediu você em relacionamento.</>, href: profileHref };
    case "message":
      return { text: <>{name} te enviou uma mensagem.</>, href: "/messages" };
  }
}

export default function NotificationsPage() {
  return (
    <PageContainer>
      <PageHeader title="Notificações" />
      <Card className="divide-y divide-border overflow-hidden">
        {notifications.map((n) => {
          const actor = n.actorId ? getUser(n.actorId) : undefined;
          const { text, href } = render(n);
          const Icon = n.type === "crush" ? CrushIcon : typeIcon[n.type];
          return (
            <Link
              key={n.id}
              href={href}
              className={cn(
                "flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-surface-2",
                !n.read && "bg-brand-tint/40",
              )}
            >
              <span className="relative shrink-0">
                {actor ? (
                  <Avatar src={actor.avatar} name={actor.displayName} size="md" />
                ) : (
                  <span className="flex size-11 items-center justify-center rounded-full bg-surface-3 text-brand">
                    <Icon className="size-5" />
                  </span>
                )}
                <span className="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full bg-surface-3 text-brand ring-2 ring-surface">
                  <Icon className="size-3" />
                </span>
              </span>
              <p className="min-w-0 flex-1 text-[15px] leading-snug text-text-secondary">
                {text}
                <span className="ml-1.5 whitespace-nowrap text-xs text-muted">
                  · {timeAgo(n.createdAt)}
                </span>
              </p>
              {!n.read && <span className="size-2 shrink-0 rounded-full bg-brand" />}
            </Link>
          );
        })}
      </Card>
    </PageContainer>
  );
}
