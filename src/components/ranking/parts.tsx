import Link from "next/link";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import type { RankingCategory, RankingEntry } from "@/types";
import { getUser, getCouple } from "@/data";
import { cn, formatNumber, formatCompact } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";

export const categoryMeta: Record<
  RankingCategory,
  { label: string; short: string; unit: string }
> = {
  flex: { label: "Flex", short: "Flex", unit: "Flex" },
  presenteados: { label: "Mais presenteados", short: "Presenteados", unit: "presentes" },
  colecionadores: { label: "Colecionadores", short: "Coleção", unit: "itens" },
  casais: { label: "Casais", short: "Casais", unit: "trocas" },
  streaks: { label: "Streaks", short: "Streaks", unit: "dias" },
};

interface Display {
  avatars: { src: string; name: string }[];
  title: string;
  subtitle: string;
  href: string;
}

export function entryDisplay(entry: RankingEntry): Display | null {
  if (entry.coupleId) {
    const c = getCouple(entry.coupleId);
    if (!c) return null;
    const a = getUser(c.userIds[0]);
    const b = getUser(c.userIds[1]);
    if (!a || !b) return null;
    return {
      avatars: [
        { src: a.avatar, name: a.displayName },
        { src: b.avatar, name: b.displayName },
      ],
      title: `${a.displayName} + ${b.displayName}`,
      subtitle: `@${a.username} · @${b.username}`,
      href: `/couple/${c.id}`,
    };
  }
  const u = entry.userId ? getUser(entry.userId) : undefined;
  if (!u) return null;
  return {
    avatars: [{ src: u.avatar, name: u.displayName }],
    title: u.displayName,
    subtitle: `@${u.username}`,
    href: `/profile/${u.username}`,
  };
}

function Delta({ delta }: { delta?: number }) {
  if (delta === undefined) return null;
  if (delta === 0)
    return (
      <span className="flex items-center gap-0.5 text-xs text-muted">
        <Minus className="size-3" />
      </span>
    );
  const up = delta > 0;
  return (
    <span
      className={cn(
        "flex items-center gap-0.5 text-xs font-semibold",
        up ? "text-success" : "text-danger",
      )}
    >
      {up ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />}
      {Math.abs(delta)}
    </span>
  );
}

export function RankingRow({
  entry,
  unit,
}: {
  entry: RankingEntry;
  unit: string;
}) {
  const d = entryDisplay(entry);
  if (!d) return null;
  return (
    <Link
      href={d.href}
      className="flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-surface-2"
    >
      <span
        className={cn(
          "tnum w-6 shrink-0 text-center text-sm font-extrabold",
          entry.rank <= 3 ? "text-text" : "text-muted",
        )}
      >
        {entry.rank}
      </span>
      <span className="relative flex shrink-0">
        <Avatar src={d.avatars[0].src} name={d.avatars[0].name} size="sm" />
        {d.avatars[1] && (
          <span className="-ml-3 ring-2 ring-surface">
            <Avatar src={d.avatars[1].src} name={d.avatars[1].name} size="sm" />
          </span>
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-bold text-text">{d.title}</span>
        <span className="block truncate text-xs text-muted">{d.subtitle}</span>
      </span>
      <Delta delta={entry.delta} />
      <span className="tnum w-20 shrink-0 text-right text-sm font-bold text-brand">
        {formatNumber(entry.value)}
      </span>
    </Link>
  );
}

const rankTone = [
  "text-gold ring-gold/40",
  "text-text-secondary ring-border-strong",
  "text-rarity-legendary/80 ring-rarity-legendary/30",
];

export function TopThree({ entries, unit }: { entries: RankingEntry[]; unit: string }) {
  const top = entries.slice(0, 3);
  // Display order: 2nd, 1st, 3rd — 1st centered and taller.
  const order = [top[1], top[0], top[2]].filter(Boolean);
  return (
    <div className="grid grid-cols-3 items-end gap-2 sm:gap-3">
      {order.map((entry) => {
        const d = entryDisplay(entry);
        if (!d) return null;
        const isFirst = entry.rank === 1;
        return (
          <Link
            key={entry.rank}
            href={d.href}
            className={cn(
              "flex flex-col items-center rounded-2xl border bg-surface px-2 py-4 text-center transition-colors hover:bg-surface-2",
              isFirst ? "border-brand/40 pb-6" : "border-border",
            )}
          >
            <span
              className={cn(
                "tnum mb-2 flex size-6 items-center justify-center rounded-full bg-surface-2 text-xs font-extrabold ring-1 ring-inset",
                rankTone[entry.rank - 1],
              )}
            >
              {entry.rank}
            </span>
            <span className="relative flex">
              <Avatar
                src={d.avatars[0].src}
                name={d.avatars[0].name}
                size={isFirst ? "xl" : "lg"}
              />
              {d.avatars[1] && (
                <span className="-ml-4 ring-2 ring-surface">
                  <Avatar src={d.avatars[1].src} name={d.avatars[1].name} size={isFirst ? "lg" : "md"} />
                </span>
              )}
            </span>
            <span className="mt-2 line-clamp-1 text-sm font-bold text-text">{d.title}</span>
            <span className="tnum text-sm font-bold text-brand">{formatCompact(entry.value)}</span>
            <span className="text-[11px] text-muted">{unit}</span>
          </Link>
        );
      })}
    </div>
  );
}
