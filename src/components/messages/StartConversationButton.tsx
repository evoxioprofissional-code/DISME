"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, MessageCircle } from "lucide-react";
import { startConversation } from "@/lib/actions";
import { cn } from "@/lib/utils";

export function StartConversationButton({
  otherId,
  className,
  label = "Conversar",
  showIcon = true,
}: {
  otherId: string;
  className?: string;
  label?: string;
  showIcon?: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);

  async function openConversation() {
    if (pending) return;
    setPending(true);
    setError(false);
    const result = await startConversation(otherId);
    if (result.ok && result.conversationId) {
      router.push(`/messages/${result.conversationId}`);
      return;
    }
    setPending(false);
    setError(true);
  }

  return (
    <button
      type="button"
      onClick={openConversation}
      disabled={pending}
      aria-label={error ? "Não foi possível abrir a conversa. Tentar novamente" : label}
      className={cn(className, error && "text-danger")}
    >
      {pending ? (
        <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
      ) : showIcon ? (
        <MessageCircle className="size-4" aria-hidden="true" />
      ) : null}
      {error ? "Tentar novamente" : label}
    </button>
  );
}
