import { Flame } from "lucide-react";
import type { Couple } from "@/types";
import { getUser, getGift } from "@/data";
import { cn, longDate, formatNumber } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { GiftGlyph } from "@/components/gifts/GiftGlyph";
import { Icon } from "@/components/icons/Icon";

export function StreakCard({ days }: { days: number }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-muted">Streak</p>
          <p className="tnum mt-0.5 flex items-baseline gap-1.5 text-3xl font-extrabold text-text">
            {formatNumber(days)}
            <span className="text-base font-semibold text-text-secondary">dias</span>
          </p>
        </div>
        <span className="flex size-11 items-center justify-center rounded-2xl bg-rarity-legendary/10 text-rarity-legendary">
          <Flame className="size-6" />
        </span>
      </div>
      <div className="mt-4 flex items-center gap-1.5">
        {Array.from({ length: 7 }).map((_, i) => (
          <span key={i} className="h-1.5 flex-1 rounded-full bg-brand" />
        ))}
      </div>
      <p className="mt-2 text-xs text-text-secondary">
        Sequência ativa. Interajam todo dia para não perder.
      </p>
    </Card>
  );
}

export function PetCard({ pet }: { pet: NonNullable<Couple["pet"]> }) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-4">
        <span className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-surface-2">
          <PetGlyph className="size-10 text-brand" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-lg font-extrabold text-text">{pet.name}</p>
            <span className="shrink-0 rounded-full bg-brand-tint px-2 py-0.5 text-[11px] font-bold text-brand">
              Nível {pet.level}
            </span>
          </div>
          <p className="text-xs text-muted">{pet.species}</p>
          <div className="mt-2">
            <div className="flex items-center justify-between text-[11px] font-semibold text-text-secondary">
              <span>Felicidade</span>
              <span className="tnum">{pet.happiness}%</span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-3">
              <div className="h-full rounded-full bg-success" style={{ width: `${pet.happiness}%` }} />
            </div>
          </div>
        </div>
      </div>
      {pet.accessories.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-3">
          {pet.accessories.map((a) => (
            <span key={a} className="rounded-full bg-surface-2 px-2.5 py-1 text-xs font-medium text-text-secondary">
              {a.replace(/-/g, " ")}
            </span>
          ))}
        </div>
      )}
    </Card>
  );
}

/** Small rounded creature — echoes the DisMe mascot, integrated to the brand. */
function PetGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" aria-hidden>
      <path
        d="M12 20c0-6 5-10 12-10s12 4 12 10c0 3 1 4 2 6 1 2 0 5-3 5-2 0-3-1-4-2-2 1-4 2-7 2s-5-1-7-2c-1 1-2 2-4 2-3 0-4-3-3-5 1-2 2-3 2-6Z"
        fill="currentColor"
        opacity={0.15}
      />
      <path
        d="M12 20c0-6 5-10 12-10s12 4 12 10c0 3 1 4 2 6 1 2 0 5-3 5-2 0-3-1-4-2-2 1-4 2-7 2s-5-1-7-2c-1 1-2 2-4 2-3 0-4-3-3-5 1-2 2-3 2-6Z"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
      <circle cx="19" cy="22" r="2" fill="currentColor" />
      <circle cx="29" cy="22" r="2" fill="currentColor" />
      <path d="M22 27c1 1 3 1 4 0" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" />
    </svg>
  );
}

export function CoupleTimeline({ couple }: { couple: Couple }) {
  const events = [...couple.history].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
  return (
    <ol className="relative ml-1 space-y-5 border-l border-border pl-6">
      {events.map((e) => {
        const from = getUser(e.fromUserId);
        const gift = e.giftId ? getGift(e.giftId) : undefined;
        return (
          <li key={e.id} className="relative">
            <span
              className={cn(
                "absolute -left-[31px] top-1 size-3 rounded-full ring-4 ring-bg",
                gift ? "bg-brand" : "bg-border-strong",
              )}
            />
            <div className="flex items-center gap-3">
              {gift && <GiftGlyph giftId={gift.id} rarity={gift.rarity} className="size-10 shrink-0" />}
              <div className="min-w-0">
                <p className="text-sm text-text">
                  <span className="font-bold">{from?.displayName}</span>{" "}
                  <span className="text-text-secondary">{e.label}</span>
                </p>
                <p className="text-xs text-muted">{longDate(e.date)}</p>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export function AchievementGrid({ items }: { items: Couple["achievements"] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
      {items.map((a) => {
        const locked = !a.unlockedAt;
        return (
          <div
            key={a.id}
            className={cn(
              "flex items-center gap-3 rounded-2xl border border-border bg-surface p-3",
              locked && "opacity-45",
            )}
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-brand">
              <Icon name={a.icon} className="size-[18px]" />
            </span>
            <span className="min-w-0 text-sm font-semibold text-text">{a.label}</span>
          </div>
        );
      })}
    </div>
  );
}
