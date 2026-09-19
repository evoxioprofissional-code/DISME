"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  type PanInfo,
} from "motion/react";
import { X, SlidersHorizontal, MapPin, Maximize2, Zap } from "lucide-react";
import type { User } from "@/types";
import { getGame } from "@/data";
import { intentMeta } from "@/lib/labels";
import { cn } from "@/lib/utils";
import { presenceLabel } from "@/components/ui/PresenceDot";
import { CrushIcon } from "@/components/icons/Crush";
import { FilterSheet, type Filters, emptyFilters } from "./FilterSheet";
import { MatchModal } from "./MatchModal";

// Deterministic demo: these users "curtem de volta".
const MATCH_BACK = new Set(["u13", "u14", "u16"]);
const CRUSH_QUOTA = 3;

function applyFilters(list: User[], f: Filters) {
  return list.filter((u) => {
    if (f.intents.length && !f.intents.includes(u.intent)) return false;
    if (f.genders.length && !f.genders.includes(u.gender)) return false;
    if (u.age < f.ageMin || u.age > f.ageMax) return false;
    if (f.onlineOnly && u.presence !== "online") return false;
    if (f.games.length && !f.games.some((g) => u.games.includes(g))) return false;
    if (f.interests.length && !f.interests.some((i) => u.interests.includes(i)))
      return false;
    return true;
  });
}

export function DiscoverDeck({ candidates }: { candidates: User[] }) {
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [crushesLeft, setCrushesLeft] = useState(CRUSH_QUOTA);
  const [match, setMatch] = useState<{ user: User; viaCrush: boolean } | null>(null);

  const deck = useMemo(() => applyFilters(candidates, filters), [candidates, filters]);
  const current = deck[index];
  const next = deck[index + 1];

  const activeFilters =
    filters.intents.length +
    filters.genders.length +
    filters.games.length +
    filters.interests.length +
    (filters.onlineOnly ? 1 : 0) +
    (filters.ageMin !== emptyFilters.ageMin || filters.ageMax !== emptyFilters.ageMax
      ? 1
      : 0);

  function advance() {
    setIndex((i) => i + 1);
  }
  function onPass() {
    advance();
  }
  function onLike(u: User) {
    if (MATCH_BACK.has(u.id)) setMatch({ user: u, viaCrush: false });
    advance();
  }
  function onCrush(u: User) {
    if (crushesLeft <= 0) return;
    setCrushesLeft((c) => c - 1);
    setMatch({ user: u, viaCrush: true });
    advance();
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Descobrir</h1>
          <p className="text-sm text-text-secondary">Encontre gente da sua vibe</p>
        </div>
        <button
          onClick={() => setSheetOpen(true)}
          className="relative flex h-10 items-center gap-2 rounded-full border border-border-strong px-3.5 text-sm font-semibold text-text transition-colors hover:bg-surface-2"
        >
          <SlidersHorizontal className="size-4" />
          Filtros
          {activeFilters > 0 && (
            <span className="flex size-5 items-center justify-center rounded-full bg-brand text-[11px] font-bold text-on-brand">
              {activeFilters}
            </span>
          )}
        </button>
      </div>

      <div className="relative aspect-[3/4.1] w-full">
        {!current ? (
          <div className="flex size-full flex-col items-center justify-center rounded-3xl border border-dashed border-border-strong bg-surface/50 px-6 text-center">
            <p className="text-base font-bold">Você viu todo mundo por agora</p>
            <p className="mt-1 text-sm text-text-secondary">
              Ajuste os filtros ou volte mais tarde para novos perfis.
            </p>
            {(index > 0 || activeFilters > 0) && (
              <button
                onClick={() => {
                  setFilters(emptyFilters);
                  setIndex(0);
                }}
                className="mt-4 rounded-full bg-surface-3 px-4 py-2 text-sm font-semibold hover:bg-hover"
              >
                Recomeçar
              </button>
            )}
          </div>
        ) : (
          <>
            {next && <DeckCard key={next.id} user={next} behind />}
            <SwipeCard
              key={current.id}
              user={current}
              onPass={onPass}
              onLike={() => onLike(current)}
            />
          </>
        )}
      </div>

      {current && (
        <div className="mt-6 flex items-center justify-center gap-4">
          <ActionButton label="Passar" onClick={onPass} variant="pass">
            <X className="size-6" strokeWidth={2.6} />
          </ActionButton>
          <ActionButton label="Curtir" onClick={() => onLike(current)} variant="like">
            <Zap className="size-7" strokeWidth={2.4} />
          </ActionButton>
          <ActionButton
            label="Crush"
            onClick={() => onCrush(current)}
            variant="crush"
            disabled={crushesLeft <= 0}
            badge={crushesLeft}
          >
            <CrushIcon className="size-6" />
          </ActionButton>
        </div>
      )}

      <FilterSheet
        open={sheetOpen}
        value={filters}
        onClose={() => setSheetOpen(false)}
        onApply={(f) => {
          setFilters(f);
          setIndex(0);
          setSheetOpen(false);
        }}
      />

      <AnimatePresence>
        {match && (
          <MatchModal
            user={match.user}
            viaCrush={match.viaCrush}
            onClose={() => setMatch(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ActionButton({
  children,
  label,
  onClick,
  variant,
  disabled,
  badge,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  variant: "pass" | "like" | "crush";
  disabled?: boolean;
  badge?: number;
}) {
  const styles = {
    pass: "size-14 bg-surface-2 text-text-secondary hover:bg-hover hover:text-text",
    like: "size-16 bg-brand text-on-brand hover:bg-brand-hover",
    crush:
      "size-14 border border-rarity-limited/40 bg-rarity-limited/10 text-rarity-limited hover:bg-rarity-limited/20",
  }[variant];
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={cn(
        "relative flex items-center justify-center rounded-full transition-colors disabled:opacity-40",
        styles,
      )}
    >
      {children}
      {typeof badge === "number" && (
        <span className="absolute -right-0.5 -top-0.5 flex size-5 items-center justify-center rounded-full bg-surface-3 text-[11px] font-bold text-text ring-2 ring-bg">
          {badge}
        </span>
      )}
    </button>
  );
}

/** Static card shown behind the top card for depth. */
function DeckCard({ user, behind }: { user: User; behind?: boolean }) {
  return (
    <div
      className={cn(
        "absolute inset-0",
        behind && "scale-[0.96] opacity-70",
      )}
      style={{ transformOrigin: "bottom center" }}
    >
      <CardShell user={user} />
    </div>
  );
}

function SwipeCard({
  user,
  onPass,
  onLike,
}: {
  user: User;
  onPass: () => void;
  onLike: () => void;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-12, 12]);
  const likeOpacity = useTransform(x, [40, 140], [0, 1]);
  const passOpacity = useTransform(x, [-140, -40], [1, 0]);

  function onDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.x > 130) onLike();
    else if (info.offset.x < -130) onPass();
  }

  return (
    <motion.div
      className="absolute inset-0 cursor-grab active:cursor-grabbing"
      style={{ x, rotate }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={onDragEnd}
      initial={{ scale: 0.98, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      whileTap={{ cursor: "grabbing" }}
    >
      <CardShell user={user}>
        <motion.span
          style={{ opacity: likeOpacity }}
          className="absolute left-5 top-5 rotate-[-8deg] rounded-lg border-2 border-brand px-3 py-1 text-lg font-extrabold uppercase tracking-wider text-brand"
        >
          Curtir
        </motion.span>
        <motion.span
          style={{ opacity: passOpacity }}
          className="absolute right-5 top-5 rotate-[8deg] rounded-lg border-2 border-text-secondary px-3 py-1 text-lg font-extrabold uppercase tracking-wider text-text-secondary"
        >
          Passar
        </motion.span>
      </CardShell>
    </motion.div>
  );
}

function CardShell({
  user,
  children,
}: {
  user: User;
  children?: React.ReactNode;
}) {
  return (
    <div className="relative size-full select-none overflow-hidden rounded-3xl border border-border bg-surface-2">
      <Image
        src={user.avatar}
        alt={user.displayName}
        fill
        sizes="384px"
        className="object-cover"
        draggable={false}
        priority
      />
      {/* bottom scrim for text legibility (functional, not decorative) */}
      <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

      <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-black/45 px-2.5 py-1 backdrop-blur-sm">
        <span
          className={cn(
            "size-2 rounded-full",
            user.presence === "online"
              ? "bg-online"
              : user.presence === "offline"
                ? "bg-muted"
                : "bg-gold",
          )}
        />
        <span className="text-xs font-semibold text-white">
          {user.presence === "online" ? "Online agora" : presenceLabel[user.presence]}
        </span>
      </div>

      <Link
        href={`/profile/${user.username}`}
        aria-label={`Abrir perfil de ${user.displayName}`}
        onPointerDownCapture={(e) => e.stopPropagation()}
        className="absolute right-4 top-4 flex size-9 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
      >
        <Maximize2 className="size-4" />
      </Link>

      <div className="absolute inset-x-0 bottom-0 space-y-2.5 p-5">
        <div className="flex items-end gap-2">
          <h2 className="text-2xl font-extrabold leading-none text-white">
            {user.displayName}
          </h2>
          <span className="tnum text-xl font-semibold text-white/90">{user.age}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-white/70">
          <span>@{user.username}</span>
          {user.location && (
            <>
              <span className="text-white/30">·</span>
              <span className="flex items-center gap-1">
                <MapPin className="size-3.5" />
                {user.location}
              </span>
            </>
          )}
        </div>
        <p className="line-clamp-2 text-sm text-white/85">{user.bio}</p>
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          <span className="inline-flex items-center gap-1 rounded-full bg-brand px-2.5 py-1 text-xs font-semibold text-on-brand">
            {intentMeta[user.intent].label}
          </span>
          {user.games.slice(0, 3).map((g) => (
            <span
              key={g}
              className="rounded-full bg-white/15 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm"
            >
              {getGame(g)?.short ?? g}
            </span>
          ))}
        </div>
      </div>
      {children}
    </div>
  );
}
