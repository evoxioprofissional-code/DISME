import Link from "next/link";
import { Gift } from "lucide-react";
import { conversations, getUser, currentUserId } from "@/data";
import { timeAgo, cn } from "@/lib/utils";
import { PageContainer } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";

export default function MessagesPage() {
  const sorted = [...conversations].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );

  return (
    <PageContainer>
      <PageHeader title="Mensagens" subtitle="Suas conversas com quem deu match" />
      <Card className="divide-y divide-border overflow-hidden">
        {sorted.map((c) => {
          const u = getUser(c.userId);
          if (!u) return null;
          const last = c.messages[c.messages.length - 1];
          const mine = last?.senderId === currentUserId;
          const preview = last?.giftId
            ? "Enviou um presente"
            : (mine ? "Você: " : "") + (last?.body ?? "");
          const unread = c.unread > 0;
          return (
            <Link
              key={c.id}
              href={`/messages/${c.id}`}
              className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-2"
            >
              <Avatar src={u.avatar} name={u.displayName} size="lg" presence={u.presence} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate font-bold text-text">{u.displayName}</span>
                  <span className={cn("shrink-0 text-xs", unread ? "font-semibold text-brand" : "text-muted")}>
                    {last ? timeAgo(last.createdAt) : ""}
                  </span>
                </div>
                <div className="mt-0.5 flex items-center gap-1.5">
                  {last?.giftId && <Gift className="size-3.5 shrink-0 text-brand" />}
                  <span
                    className={cn(
                      "truncate text-sm",
                      unread ? "font-semibold text-text" : "text-text-secondary",
                    )}
                  >
                    {preview}
                  </span>
                  {unread && (
                    <span className="ml-auto shrink-0 rounded-full bg-brand px-1.5 text-center text-[11px] font-bold leading-5 text-on-brand">
                      {c.unread}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </Card>
    </PageContainer>
  );
}
