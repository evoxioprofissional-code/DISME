"use client";

import { useMemo, useState } from "react";
import { AnimatePresence } from "motion/react";
import { Coins } from "lucide-react";
import type { Gift, GiftCategory, User } from "@/types";
import { cn, formatNumber } from "@/lib/utils";
import { GiftGlyph } from "./GiftGlyph";
import { RarityTag } from "@/components/ui/RarityTag";
import { SendGiftModal } from "./SendGiftModal";
import { GiftRevealModal } from "./GiftRevealModal";
import { useAuthGate } from "@/components/auth/AuthProvider";

const CATS: { key: GiftCategory | "todos"; label: string }[] = [
  { key: "todos", label: "Todos" },
  { key: "populares", label: "Populares" },
  { key: "romanticos", label: "Românticos" },
  { key: "raros", label: "Raros" },
  { key: "colecionaveis", label: "Colecionáveis" },
  { key: "limitados", label: "Limitados" },
];

function GiftCard({ gift, onSelect }: { gift: Gift; onSelect: () => void }) {
  const remaining = gift.supply ? gift.supply - (gift.minted ?? 0) : undefined;
  const pctLeft = gift.supply ? (remaining! / gift.supply) * 100 : undefined;
  return (
    <button
      onClick={onSelect}
      className="group flex flex-col rounded-2xl border border-border bg-surface p-3 text-left transition-colors hover:border-border-strong hover:bg-surface-2"
    >
      <GiftGlyph giftId={gift.id} rarity={gift.rarity} className="mb-3 aspect-square w-full" />
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-sm font-bold text-text">{gift.name}</p>
      </div>
      <div className="mt-1"><RarityTag rarity={gift.rarity} /></div>
      {gift.supply && (
        <div className="mt-2.5">
          <div className="h-1 overflow-hidden rounded-full bg-surface-3">
            <div className="h-full rounded-full bg-rarity-limited" style={{ width: `${pctLeft}%` }} />
          </div>
          <p className="tnum mt-1 text-[11px] text-muted">
            {formatNumber(remaining!)} de {formatNumber(gift.supply)} restantes
          </p>
        </div>
      )}
      <div className="mt-3 flex items-center gap-1 text-sm font-bold text-brand">
        <Coins className="size-4" />
        {formatNumber(gift.price)}
      </div>
    </button>
  );
}

export function GiftStore({ gifts, credits, candidates, presetUser }: { gifts: Gift[]; credits: number; candidates: User[]; presetUser?: User }) {
  const { requireAuth } = useAuthGate();
  const [cat, setCat] = useState<GiftCategory | "todos">("todos");
  const [selected, setSelected] = useState<Gift | null>(null);
  const [sent, setSent] = useState<{ gift: Gift; recipient: User } | null>(null);

  const list = useMemo(
    () => (cat === "todos" ? gifts : gifts.filter((g) => g.category === cat)),
    [cat, gifts],
  );

  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-3 rounded-2xl border border-border bg-surface px-4 py-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Seus créditos</p>
          <p className="tnum flex items-center gap-1.5 text-lg font-extrabold text-text">
            <Coins className="size-4 text-gold" />
            {formatNumber(credits)}
          </p>
        </div>
        <button className="rounded-full bg-surface-3 px-4 py-2 text-sm font-semibold text-text transition-colors hover:bg-hover">
          Adicionar créditos
        </button>
      </div>

      {presetUser && (
        <p className="mb-4 text-sm text-text-secondary">
          Escolha um presente para{" "}
          <span className="font-bold text-text">{presetUser.displayName}</span>.
        </p>
      )}

      <div className="no-scrollbar -mx-4 mb-5 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        {CATS.map((c) => (
          <button
            key={c.key}
            onClick={() => setCat(c.key)}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors",
              cat === c.key
                ? "bg-brand text-on-brand"
                : "bg-surface-2 text-text-secondary hover:bg-hover hover:text-text",
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {list.map((g) => (
          <GiftCard key={g.id} gift={g} onSelect={() => requireAuth(() => setSelected(g))} />
        ))}
      </div>

      <AnimatePresence>
        {selected && (
          <SendGiftModal
            gift={selected}
            credits={credits}
            candidates={candidates}
            presetUser={presetUser}
            onClose={() => setSelected(null)}
            onSent={(recipient) => {
              const g = selected;
              setSelected(null);
              setSent({ gift: g, recipient });
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {sent && (
          <GiftRevealModal
            gift={sent.gift}
            eyebrow="Presente enviado"
            title={`${sent.gift.name} a caminho`}
            description={`${sent.recipient.displayName} recebe agora. Vai render um bom papo.`}
            actions={[
              { label: "Ver perfil", href: `/profile/${sent.recipient.username}` },
              { label: "Fechar", variant: "secondary", onClick: () => setSent(null) },
            ]}
            onClose={() => setSent(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
