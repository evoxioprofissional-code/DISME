"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Gift, ImageIcon, Send } from "lucide-react";
import type { Conversation, Message, User } from "@/types";
import { getGift } from "@/data";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import { GiftGlyph } from "@/components/gifts/GiftGlyph";
import { presenceLabel } from "@/components/ui/PresenceDot";

function timeLabel(iso: string) {
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function Bubble({ message, mine }: { message: Message; mine: boolean }) {
  const gift = message.giftId ? getGift(message.giftId) : undefined;
  return (
    <div className={cn("flex", mine ? "justify-end" : "justify-start")}>
      <div className={cn("max-w-[78%]", mine ? "items-end" : "items-start")}>
        {gift ? (
          <div
            className={cn(
              "flex items-center gap-3 rounded-2xl border p-2.5",
              mine ? "border-brand/30 bg-brand-tint" : "border-border bg-surface-2",
            )}
          >
            <GiftGlyph giftId={gift.id} rarity={gift.rarity} className="size-12 shrink-0" />
            <div className="pr-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Presente</p>
              <p className="text-sm font-bold text-text">{gift.name}</p>
            </div>
          </div>
        ) : (
          <div
            className={cn(
              "rounded-2xl px-3.5 py-2 text-[15px] leading-snug",
              mine
                ? "rounded-br-md bg-brand text-on-brand"
                : "rounded-bl-md bg-surface-2 text-text",
            )}
          >
            {message.body}
          </div>
        )}
        <p className={cn("mt-1 text-[11px] text-muted", mine ? "text-right" : "text-left")}>
          {timeLabel(message.createdAt)}
        </p>
      </div>
    </div>
  );
}

export function ChatThread({
  conversation,
  other,
  meId,
}: {
  conversation: Conversation;
  other: User;
  meId: string;
}) {
  const [messages, setMessages] = useState<Message[]>(conversation.messages);
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  function send() {
    const body = draft.trim();
    if (!body) return;
    setMessages((m) => [
      ...m,
      {
        id: `local-${Date.now()}`,
        senderId: meId,
        body,
        createdAt: new Date().toISOString(),
        read: true,
      },
    ]);
    setDraft("");
  }

  return (
    <div className="flex h-[calc(100dvh-3.5rem-5rem)] flex-col lg:h-dvh">
      {/* Header */}
      <header className="flex shrink-0 items-center gap-3 border-b border-border bg-surface px-3 py-2.5">
        <Link
          href="/messages"
          aria-label="Voltar"
          className="flex size-9 items-center justify-center rounded-full text-text-secondary hover:bg-surface-2 lg:hidden"
        >
          <ChevronLeft className="size-5" />
        </Link>
        <Link href={`/profile/${other.username}`} className="flex min-w-0 items-center gap-3">
          <Avatar src={other.avatar} name={other.displayName} size="md" presence={other.presence} />
          <div className="min-w-0">
            <p className="truncate font-bold text-text">{other.displayName}</p>
            <p className="truncate text-xs text-muted">
              {other.presence === "online" ? "Online agora" : presenceLabel[other.presence]}
            </p>
          </div>
        </Link>
      </header>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.map((m) => (
          <Bubble key={m.id} message={m} mine={m.senderId === meId} />
        ))}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 border-t border-border bg-surface px-3 py-2.5">
        <div className="flex items-center gap-2">
          <Link
            href={`/gifts?to=${other.username}`}
            aria-label="Enviar presente"
            className="flex size-10 shrink-0 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-surface-2 hover:text-brand"
          >
            <Gift className="size-5" />
          </Link>
          <button
            aria-label="Enviar imagem"
            className="hidden size-10 shrink-0 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-surface-2 sm:flex"
          >
            <ImageIcon className="size-5" />
          </button>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder={`Mensagem para ${other.displayName}`}
            className="h-11 min-w-0 flex-1 rounded-full bg-surface-2 px-4 text-[15px] text-text placeholder:text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          />
          <button
            onClick={send}
            disabled={!draft.trim()}
            aria-label="Enviar"
            className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand text-on-brand transition-colors hover:bg-brand-hover disabled:opacity-40"
          >
            <Send className="size-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
