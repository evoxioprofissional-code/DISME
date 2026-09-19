import { cn } from "@/lib/utils";
import type { Rarity } from "@/types";
import { rarityLabel } from "@/data/gifts";

const styles: Record<Rarity, { text: string; dot: string; ring: string }> = {
  common: { text: "text-rarity-common", dot: "bg-rarity-common", ring: "ring-rarity-common/30" },
  rare: { text: "text-rarity-rare", dot: "bg-rarity-rare", ring: "ring-rarity-rare/40" },
  epic: { text: "text-rarity-epic", dot: "bg-rarity-epic", ring: "ring-rarity-epic/40" },
  legendary: { text: "text-rarity-legendary", dot: "bg-rarity-legendary", ring: "ring-rarity-legendary/40" },
  limited: { text: "text-rarity-limited", dot: "bg-rarity-limited", ring: "ring-rarity-limited/40" },
};

export function RarityTag({ rarity, className }: { rarity: Rarity; className?: string }) {
  const s = styles[rarity];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ring-1 ring-inset",
        s.text,
        s.ring,
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", s.dot)} />
      {rarityLabel[rarity]}
    </span>
  );
}

export { styles as rarityStyles };
