"use client";

import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { X, Search, Coins, Check } from "lucide-react";
import type { Gift, User } from "@/types";
import { cn, formatNumber } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import { GiftGlyph } from "./GiftGlyph";
import { RarityTag } from "@/components/ui/RarityTag";
import { sendGift } from "@/lib/actions";

export function SendGiftModal({
  gift,
  credits,
  candidates,
  presetUser,
  onClose,
  onSent,
}: {
  gift: Gift;
  credits: number;
  candidates: User[];
  presetUser?: User;
  onClose: () => void;
  onSent: (recipient: User) => void;
}) {
  const [recipient, setRecipient] = useState<User | undefined>(presetUser);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");

  const filteredCandidates = useMemo(() => {
    if (!query.trim()) return candidates.slice(0, 8);
    const q = query.toLowerCase();
    return candidates.filter(
      (u) => u.displayName.toLowerCase().includes(q) || u.username.toLowerCase().includes(q),
    );
  }, [query, candidates]);

  const affordable = credits >= gift.price;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <motion.div
        className="absolute inset-0 bg-black/70"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        role="dialog"
        aria-label={`Enviar ${gift.name}`}
        className="relative flex max-h-[90dvh] w-full flex-col overflow-hidden rounded-t-3xl border border-border bg-surface sm:max-w-md sm:rounded-3xl"
        initial={{ y: "100%", opacity: 0.6 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0.6 }}
        transition={{ type: "spring", stiffness: 320, damping: 34 }}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-lg font-extrabold">Enviar presente</h2>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="flex size-8 items-center justify-center rounded-full text-text-secondary hover:bg-surface-2"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
          <div className="flex items-center gap-4 rounded-2xl bg-surface-2 p-4">
            <GiftGlyph giftId={gift.id} rarity={gift.rarity} className="size-16 shrink-0" />
            <div className="min-w-0">
              <p className="font-bold text-text">{gift.name}</p>
              <div className="mt-1"><RarityTag rarity={gift.rarity} /></div>
              <p className="mt-1.5 flex items-center gap-1 text-sm font-bold text-brand">
                <Coins className="size-4" />
                {formatNumber(gift.price)} créditos
              </p>
            </div>
          </div>

          {presetUser ? (
            <div className="flex items-center gap-3 rounded-2xl border border-brand/30 bg-brand-tint px-4 py-3">
              <Avatar src={presetUser.avatar} name={presetUser.displayName} size="sm" />
              <span className="flex-1 text-sm">
                Para <span className="font-bold text-text">{presetUser.displayName}</span>
              </span>
              <Check className="size-5 text-brand" />
            </div>
          ) : (
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">
                Para quem?
              </p>
              <div className="relative mb-2">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar pessoa"
                  className="h-11 w-full rounded-full bg-surface-2 pl-9 pr-4 text-sm text-text placeholder:text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                />
              </div>
              <div className="no-scrollbar max-h-52 space-y-1 overflow-y-auto">
                {filteredCandidates.map((u) => {
                  const active = recipient?.id === u.id;
                  return (
                    <button
                      key={u.id}
                      onClick={() => setRecipient(u)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors",
                        active ? "bg-brand-tint ring-1 ring-inset ring-brand/40" : "hover:bg-surface-2",
                      )}
                    >
                      <Avatar src={u.avatar} name={u.displayName} size="sm" presence={u.presence} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold text-text">{u.displayName}</span>
                        <span className="block truncate text-xs text-muted">@{u.username}</span>
                      </span>
                      {active && <Check className="size-4 text-brand" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">
              Mensagem (opcional)
            </p>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={2}
              maxLength={140}
              placeholder="Escreva algo memorável"
              className="w-full resize-none rounded-2xl bg-surface-2 px-4 py-3 text-sm text-text placeholder:text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 border-t border-border px-5 py-4">
          <div className="flex items-center gap-1.5 text-sm text-text-secondary">
            <Coins className="size-4 text-gold" />
            <span className="tnum font-semibold text-text">{formatNumber(credits)}</span>
          </div>
          <button
            disabled={!recipient || !affordable}
            onClick={async () => {
              if (!recipient) return;
              const result = await sendGift(recipient.id, gift.id, message);
              if (result.ok) onSent(recipient);
            }}
            className="flex-1 rounded-full bg-brand py-3 text-sm font-bold text-on-brand transition-colors hover:bg-brand-hover disabled:opacity-40"
          >
            {affordable ? "Enviar presente" : "Créditos insuficientes"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
