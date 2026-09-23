import Link from "next/link";
import { Zap, Gift, TrendingUp, HeartHandshake, MessageCircle, Layers } from "lucide-react";
import { getGift } from "@/data";
import type { NotificationType } from "@/types";
import { timeAgo, cn } from "@/lib/utils";
import { PageContainer } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { CrushIcon } from "@/components/icons/Crush";
import { getMyProfile, listNotifications, type NotifData } from "@/lib/queries";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoginCta } from "@/components/auth/LoginCta";
import { NotificationsReadMarker } from "@/components/notifications/NotificationsReadMarker";

const typeIcon = {
  match: Zap,
  gift: Gift,
  crush: HeartHandshake,
  milestone: Layers,
  ranking: TrendingUp,
  relationship: HeartHandshake,
  message: MessageCircle,
} as const;

function render(n: NotifData, myUsername: string): { text: React.ReactNode; href: string } {
  const actor = n.actor;
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
            href: `/collection/${myUsername}`,
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
    case "message": {
      const conversationId =
        typeof n.meta?.conversation_id === "string" ? n.meta.conversation_id : null;
      const preview = typeof n.meta?.preview === "string" ? n.meta.preview : null;
      return {
        text: (
          <>
            {name} te enviou uma mensagem
            {preview && <span className="text-text">: “{preview}”</span>}.
          </>
        ),
        href: conversationId ? `/messages/${conversationId}` : "/messages",
      };
    }
    default:
      return { text: <>Você recebeu uma nova notificação.</>, href: "/home" };
  }
}

export default async function NotificationsPage() {
  const me = await getMyProfile();
  if (!me) {
    return (
      <PageContainer>
        <PageHeader title="Notificações" />
        <LoginCta
          title="Entre para ver suas notificações"
          description="Matches, presentes, crushes e conquistas aparecem aqui."
        />
      </PageContainer>
    );
  }
  const notifications = await listNotifications();
  const hasUnread = notifications.some((notification) => !notification.read);
  return (
    <PageContainer>
      {hasUnread && <NotificationsReadMarker />}
      <PageHeader title="Notificações" />
      {notifications.length === 0 ? (
        <EmptyState title="Tudo tranquilo por aqui" description="Matches, presentes e mensagens aparecerão nesta central." />
      ) : (
      <Card className="divide-y divide-border overflow-hidden">
        {notifications.map((n) => {
          const actor = n.actor;
          const { text, href } = render(n, me?.username ?? "me");
          const notificationType = n.type as NotificationType;
          const Icon = notificationType === "crush" ? CrushIcon : typeIcon[notificationType];
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
      )}
    </PageContainer>
  );
}
