import Link from "next/link";
import { Gift } from "lucide-react";
import { timeAgo, cn } from "@/lib/utils";
import { PageContainer } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { getSessionUserId, listConversations } from "@/lib/queries";
import { EmptyState } from "@/components/ui/EmptyState";
import { redirect } from "next/navigation";

export default async function MessagesPage() {
  const meId = await getSessionUserId();
  if (!meId) redirect("/login");
  const sorted = await listConversations(meId);

  return (
    <PageContainer>
      <PageHeader title="Mensagens" subtitle="Suas conversas com quem deu match" />
      {sorted.length === 0 ? (
        <EmptyState title="Nenhuma conversa" description="Quando você conversar com um match, ela aparece aqui." />
      ) : (
      <Card className="divide-y divide-border overflow-hidden">
        {sorted.map((c) => {
          const u = c.other;
          const mine = c.lastSenderId === meId;
          const preview = c.lastGiftId
            ? "Enviou um presente"
            : (mine ? "Você: " : "") + (c.lastBody ?? "Conversa iniciada");
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
                    {timeAgo(c.updatedAt)}
                  </span>
                </div>
                <div className="mt-0.5 flex items-center gap-1.5">
                  {c.lastGiftId && <Gift className="size-3.5 shrink-0 text-brand" />}
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
      )}
    </PageContainer>
  );
}
