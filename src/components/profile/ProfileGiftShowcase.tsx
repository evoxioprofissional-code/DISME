"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, ChevronLeft, ChevronRight, Gift, Lock, Plus, X } from "lucide-react";
import { GiftGlyph } from "@/components/gifts/GiftGlyph";
import { Avatar } from "@/components/ui/Avatar";
import { RarityTag } from "@/components/ui/RarityTag";
import { saveFeaturedGifts } from "@/lib/actions";
import { cn, formatNumber, timeAgo } from "@/lib/utils";
import type {
  ProfileCollectionItem,
  ProfileGiftHistoryItem,
} from "@/lib/profile-showcase";

type Tab = "collection" | "received" | "sent";

export function ProfileGiftShowcase({
  collection,
  featured,
  received,
  sent,
  isSelf,
}: {
  collection: ProfileCollectionItem[];
  featured: ProfileCollectionItem[];
  received: ProfileGiftHistoryItem[];
  sent: ProfileGiftHistoryItem[];
  isSelf: boolean;
}) {
  const [tab, setTab] = useState<Tab>("collection");
  const [editing, setEditing] = useState(false);

  return (
    <>
      <section className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2 text-sm font-extrabold text-text">
              <Gift className="size-4 text-brand" />
              Presentes em destaque
            </h2>
            <p className="mt-1 text-xs leading-5 text-muted">
              Escolha até 3 presentes para exibir no seu perfil.
            </p>
          </div>
          {isSelf && (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="shrink-0 rounded-full border border-border-strong px-3 py-1.5 text-[11px] font-bold text-text-secondary transition-colors hover:bg-hover hover:text-text"
            >
              Editar destaque
            </button>
          )}
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2.5 sm:gap-3">
          {Array.from({ length: 3 }, (_, index) => {
            const item = featured[index];
            return item ? (
              <FeaturedGift key={item.gift.id} item={item} />
            ) : (
              <button
                key={`empty-${index}`}
                type="button"
                onClick={() => isSelf && setEditing(true)}
                disabled={!isSelf}
                className="flex min-h-32 flex-col items-center justify-center rounded-xl border border-dashed border-border-strong bg-bg/35 px-2 text-center text-muted transition-colors enabled:hover:border-brand/55 enabled:hover:text-text-secondary sm:min-h-40"
              >
                <Plus className="size-5" />
                <span className="mt-2 text-[10px] font-semibold sm:text-xs">Adicione um presente</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-b border-border pb-3">
          <div className="flex items-center gap-1 rounded-full bg-bg p-1" role="tablist" aria-label="Coleção de presentes">
            <TabButton active={tab === "collection"} onClick={() => setTab("collection")}>Coleção</TabButton>
            <TabButton active={tab === "received"} onClick={() => setTab("received")}>Recebidos</TabButton>
            <TabButton active={tab === "sent"} onClick={() => setTab("sent")}>Enviados</TabButton>
          </div>
          <p className="tnum text-[11px] font-semibold text-muted">
            {collection.filter((item) => item.unlocked).length}/{collection.length} desbloqueados
          </p>
        </div>

        {tab === "collection" ? (
          <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
            {collection.map((item) => (
              <CollectionGift key={item.gift.id} item={item} />
            ))}
          </div>
        ) : (
          <GiftHistory items={tab === "received" ? received : sent} direction={tab} />
        )}
      </section>

      {editing && (
        <FeaturedGiftEditor
          collection={collection.filter((item) => item.unlocked)}
          initial={featured.map((item) => item.gift.id)}
          onClose={() => setEditing(false)}
        />
      )}
    </>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "rounded-full px-3 py-1.5 text-[11px] font-bold transition-colors",
        active ? "bg-brand text-on-brand" : "text-muted hover:text-text",
      )}
    >
      {children}
    </button>
  );
}

function FeaturedGift({ item }: { item: ProfileCollectionItem }) {
  return (
    <div className="group min-w-0 rounded-xl border border-border bg-bg/45 p-2.5 text-center transition-[transform,border-color] hover:-translate-y-0.5 hover:border-border-strong sm:p-3">
      <GiftGlyph giftId={item.gift.id} rarity={item.gift.rarity} className="mx-auto aspect-square w-full max-w-28 bg-transparent ring-0" />
      <p className="tnum mt-1 text-[11px] font-semibold text-muted">×{item.quantity}</p>
      <p className="truncate text-xs font-extrabold text-text sm:text-sm">{item.gift.name}</p>
      <RarityTag rarity={item.gift.rarity} className="mt-2 max-w-full px-1.5 text-[8px] sm:text-[9px]" />
    </div>
  );
}

function CollectionGift({ item }: { item: ProfileCollectionItem }) {
  return (
    <div
      className={cn(
        "group relative min-w-0 rounded-xl border border-border bg-bg/45 p-2.5 transition-[transform,border-color] hover:-translate-y-0.5 hover:border-border-strong",
        !item.unlocked && "opacity-45",
      )}
    >
      {!item.unlocked && (
        <span className="absolute right-2 top-2 z-10 flex size-6 items-center justify-center rounded-full border border-border bg-surface text-muted">
          <Lock className="size-3" />
        </span>
      )}
      <GiftGlyph giftId={item.gift.id} rarity={item.gift.rarity} className="aspect-square w-full bg-transparent ring-0" />
      <p className="tnum mt-1 text-[11px] font-semibold text-muted">×{item.quantity}</p>
      <p className="truncate text-xs font-extrabold text-text">{item.gift.name}</p>
      <RarityTag rarity={item.gift.rarity} className="mt-2 px-1.5 text-[8px]" />
    </div>
  );
}

function GiftHistory({ items, direction }: { items: ProfileGiftHistoryItem[]; direction: "received" | "sent" }) {
  if (!items.length) {
    return (
      <div className="flex min-h-44 flex-col items-center justify-center text-center">
        <Gift className="size-6 text-muted" />
        <p className="mt-3 text-sm font-bold text-text">Nenhum presente {direction === "received" ? "recebido" : "enviado"}</p>
        <p className="mt-1 text-xs text-muted">O histórico aparecerá aqui.</p>
      </div>
    );
  }

  return (
    <div className="mt-2 divide-y divide-border">
      {items.slice(0, 16).map((item) => (
        <div key={item.id} className="flex min-w-0 items-center gap-3 py-3">
          <GiftGlyph giftId={item.gift.id} rarity={item.gift.rarity} className="size-12 shrink-0 bg-bg ring-border" />
          {item.actor ? (
            <Link href={`/profile/${item.actor.username}`} className="flex min-w-0 flex-1 items-center gap-2.5">
              <Avatar src={item.actor.avatar} name={item.actor.displayName} size="sm" />
              <div className="min-w-0">
                <p className="truncate text-xs font-bold text-text">@{item.actor.username}</p>
                <p className="truncate text-[11px] text-muted">{item.gift.name}</p>
              </div>
            </Link>
          ) : (
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-text">Usuário indisponível</p>
              <p className="truncate text-[11px] text-muted">{item.gift.name}</p>
            </div>
          )}
          <div className="shrink-0 text-right">
            {direction === "sent" && (
              <p className="tnum text-[11px] font-bold text-text-secondary">{formatNumber(item.creditsSpent ?? 0)} créditos</p>
            )}
            <p className="mt-0.5 text-[10px] text-muted">{timeAgo(item.receivedAt)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function FeaturedGiftEditor({
  collection,
  initial,
  onClose,
}: {
  collection: ProfileCollectionItem[];
  initial: string[];
  onClose: () => void;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState(initial);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const byId = useMemo(() => new Map(collection.map((item) => [item.gift.id, item])), [collection]);

  function toggle(id: string) {
    setError("");
    setSelected((current) => {
      if (current.includes(id)) return current.filter((giftId) => giftId !== id);
      if (current.length === 3) return current;
      return [...current, id];
    });
  }

  function move(index: number, delta: number) {
    setSelected((current) => {
      const next = [...current];
      const target = index + delta;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function save() {
    startTransition(async () => {
      const result = await saveFeaturedGifts(selected);
      if (!result.ok) {
        setError(result.error ?? "Não foi possível salvar.");
        return;
      }
      router.refresh();
      onClose();
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button type="button" aria-label="Fechar" className="absolute inset-0 bg-black/75" onClick={onClose} />
      <div role="dialog" aria-modal="true" aria-labelledby="featured-title" className="relative max-h-[86vh] w-full overflow-y-auto rounded-t-2xl border border-border bg-surface p-5 shadow-lg sm:max-w-lg sm:rounded-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="featured-title" className="text-base font-extrabold text-text">Editar destaques</h2>
            <p className="mt-1 text-xs text-muted">Selecione e ordene até 3 presentes desbloqueados.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Fechar" className="flex size-8 items-center justify-center rounded-full text-muted hover:bg-hover hover:text-text">
            <X className="size-4" />
          </button>
        </div>

        {selected.length > 0 && (
          <div className="mt-5 space-y-2">
            {selected.map((id, index) => {
              const item = byId.get(id);
              if (!item) return null;
              return (
                <div key={id} className="flex items-center gap-3 rounded-xl border border-border bg-bg/50 p-2">
                  <GiftGlyph giftId={id} rarity={item.gift.rarity} className="size-11 shrink-0" />
                  <span className="min-w-0 flex-1 truncate text-xs font-bold text-text">{index + 1}. {item.gift.name}</span>
                  <button type="button" onClick={() => move(index, -1)} disabled={index === 0} aria-label="Mover para esquerda" className="flex size-8 items-center justify-center rounded-full text-muted enabled:hover:bg-hover enabled:hover:text-text disabled:opacity-25"><ChevronLeft className="size-4" /></button>
                  <button type="button" onClick={() => move(index, 1)} disabled={index === selected.length - 1} aria-label="Mover para direita" className="flex size-8 items-center justify-center rounded-full text-muted enabled:hover:bg-hover enabled:hover:text-text disabled:opacity-25"><ChevronRight className="size-4" /></button>
                  <button type="button" onClick={() => toggle(id)} aria-label="Remover" className="flex size-8 items-center justify-center rounded-full text-muted hover:bg-danger-tint hover:text-danger"><X className="size-4" /></button>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-5 grid grid-cols-3 gap-2.5">
          {collection.map((item) => {
            const active = selected.includes(item.gift.id);
            return (
              <button
                key={item.gift.id}
                type="button"
                onClick={() => toggle(item.gift.id)}
                aria-pressed={active}
                className={cn("relative rounded-xl border p-2 text-left transition-colors", active ? "border-brand bg-brand-tint" : "border-border bg-bg/40 hover:border-border-strong")}
              >
                {active && <span className="absolute right-2 top-2 z-10 flex size-5 items-center justify-center rounded-full bg-brand text-white"><Check className="size-3" /></span>}
                <GiftGlyph giftId={item.gift.id} rarity={item.gift.rarity} className="aspect-square w-full bg-transparent ring-0" />
                <p className="mt-1 truncate text-[11px] font-bold text-text">{item.gift.name}</p>
              </button>
            );
          })}
        </div>

        {!collection.length && <p className="py-12 text-center text-sm text-muted">Receba um presente para poder destacá-lo.</p>}
        {error && <p role="alert" className="mt-4 text-xs font-semibold text-danger">{error}</p>}
        <div className="mt-5 flex justify-end gap-2 border-t border-border pt-4">
          <button type="button" onClick={onClose} className="rounded-full px-4 py-2 text-xs font-bold text-text-secondary hover:bg-hover">Cancelar</button>
          <button type="button" onClick={save} disabled={pending} className="rounded-full bg-brand px-5 py-2 text-xs font-bold text-white hover:bg-brand-hover disabled:opacity-60">{pending ? "Salvando..." : "Salvar"}</button>
        </div>
      </div>
    </div>
  );
}
