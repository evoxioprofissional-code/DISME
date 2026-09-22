"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MessageCircle, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface ToastData {
  id: string;
  conversationId?: string;
  actorName: string;
  preview?: string;
}

export function MessageNotificationToast({ userId }: { userId: string }) {
  const router = useRouter();
  const [toast, setToast] = useState<ToastData | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`message-notifications:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `profile_id=eq.${userId}`,
        },
        async (payload) => {
          const row = payload.new as {
            id: string;
            type: string;
            actor_id: string | null;
            meta: { conversation_id?: string; preview?: string } | null;
          };
          if (row.type !== "message") return;

          let actorName = "Seu match";
          if (row.actor_id) {
            const { data } = await supabase
              .from("profiles")
              .select("display_name")
              .eq("id", row.actor_id)
              .maybeSingle();
            if (data?.display_name) actorName = data.display_name;
          }

          setToast({
            id: row.id,
            conversationId: row.meta?.conversation_id,
            actorName,
            preview: row.meta?.preview,
          });
          router.refresh();

          if (timerRef.current) clearTimeout(timerRef.current);
          timerRef.current = setTimeout(() => setToast(null), 6000);
        },
      )
      .subscribe();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      void supabase.removeChannel(channel);
    };
  }, [router, userId]);

  if (!toast) return null;

  const href = toast.conversationId ? `/messages/${toast.conversationId}` : "/messages";

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-3 bottom-24 z-50 mx-auto flex max-w-sm items-start gap-3 rounded-2xl border border-border-strong bg-surface-2 p-3 shadow-lg lg:inset-x-auto lg:bottom-5 lg:right-5 lg:mx-0 lg:w-96"
    >
      <Link href={href} onClick={() => setToast(null)} className="flex min-w-0 flex-1 gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-tint text-brand">
          <MessageCircle className="size-5" aria-hidden="true" />
        </span>
        <span className="min-w-0 pt-0.5">
          <span className="block text-sm font-bold text-text">Nova mensagem de {toast.actorName}</span>
          <span className="mt-0.5 block truncate text-sm text-text-secondary">
            {toast.preview ?? "Abra a conversa para responder."}
          </span>
        </span>
      </Link>
      <button
        type="button"
        onClick={() => setToast(null)}
        aria-label="Fechar notificação"
        className="flex size-8 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-hover hover:text-text"
      >
        <X className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}
