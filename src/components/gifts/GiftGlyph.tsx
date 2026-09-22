import { cn } from "@/lib/utils";
import type { Rarity } from "@/types";
import { getGift, rarityColorVar } from "@/data/gifts";
import Image from "next/image";

/**
 * Hand-drawn gift marks. Each gift renders as a bespoke line illustration
 * (never an emoji, never a tiny icon in a bright square). The art color comes
 * from the item's rarity; the tile stays neutral so the object is the hero.
 */
function Glyph({ id }: { id: string }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (id) {
    case "rosa":
      return (
        <g {...common}>
          <path d="M24 30c0-6 3-11 8-11s8 4 8 10-4 10-8 10-8-3-8-9Z" />
          <path d="M28 27c2-3 6-3 8 0M27 32c2 3 8 3 10 0M32 19v25" />
          <path d="M32 38c-4 1-8-1-9-5 4-1 8 1 9 5ZM32 40c4 1 8-1 9-5-4-1-8 1-9 5Z" />
        </g>
      );
    case "carta":
      return (
        <g {...common}>
          <rect x="18" y="22" width="28" height="21" rx="3" />
          <path d="M18 25l14 10 14-10" />
          <path d="M32 36c-1.6-1.6-4-1.4-4 1 0 1.8 2.4 3 4 4 1.6-1 4-2.2 4-4 0-2.4-2.4-2.6-4-1Z" fill="currentColor" stroke="none" />
        </g>
      );
    case "ursinho":
      return (
        <g {...common}>
          <circle cx="24" cy="21" r="4" />
          <circle cx="40" cy="21" r="4" />
          <circle cx="32" cy="27" r="9" />
          <path d="M23 40c0-5 4-8 9-8s9 3 9 8v3a2 2 0 0 1-2 2H25a2 2 0 0 1-2-2Z" />
          <circle cx="29" cy="26" r="1.1" fill="currentColor" stroke="none" />
          <circle cx="35" cy="26" r="1.1" fill="currentColor" stroke="none" />
          <path d="M30 30c1 1 3 1 4 0" />
        </g>
      );
    case "cafe":
      return (
        <g {...common}>
          <path d="M20 28h20v8a8 8 0 0 1-8 8h-4a8 8 0 0 1-8-8Z" />
          <path d="M40 30h3a4 4 0 0 1 0 8h-3" />
          <path d="M26 20c-1 2 1 3 0 5M32 19c-1 2 1 3 0 5" />
        </g>
      );
    case "controle":
      return (
        <g {...common}>
          <path d="M22 26h20c4 0 7 4 7 9 0 4-2 7-5 7-2 0-3-1-4-3l-2-3H27l-2 3c-1 2-2 3-4 3-3 0-5-3-5-7 0-5 3-9 6-9Z" />
          <path d="M24 32v5M21.5 34.5h5" />
          <circle cx="39" cy="33" r="1.3" fill="currentColor" stroke="none" />
          <circle cx="43" cy="36" r="1.3" fill="currentColor" stroke="none" />
        </g>
      );
    case "alianca":
      return (
        <g {...common}>
          <circle cx="27" cy="34" r="8" />
          <circle cx="38" cy="34" r="8" />
          <path d="M27 22l-2 3h4Z" fill="currentColor" stroke="none" />
        </g>
      );
    case "coroa":
      return (
        <g {...common}>
          <path d="M18 38l-2-14 8 6 8-11 8 11 8-6-2 14Z" />
          <path d="M18 38h28" />
        </g>
      );
    case "galaxia":
      return (
        <g {...common}>
          <path d="M32 20c7 0 12 5 12 12s-5 12-12 12c-5 0-9-3-9-7 0-3 2-5 5-5 2 0 4 1 4 3" />
          <circle cx="32" cy="32" r="2.2" fill="currentColor" stroke="none" />
          <circle cx="44" cy="22" r="1" fill="currentColor" stroke="none" />
          <circle cx="20" cy="40" r="1" fill="currentColor" stroke="none" />
          <circle cx="46" cy="40" r="1.3" fill="currentColor" stroke="none" />
        </g>
      );
    case "coroa-cristal":
      return (
        <g {...common}>
          <path d="M20 27h24l-5 6H25Z" />
          <path d="M25 33h14l-7 12Z" />
          <path d="M32 27v6M28 27l-3 6M36 27l3 6" />
        </g>
      );
    case "eclipse":
      return (
        <g {...common}>
          <circle cx="32" cy="32" r="12" />
          <path d="M32 20a12 12 0 0 0 0 24 9 9 0 0 1 0-24Z" fill="currentColor" stroke="none" />
        </g>
      );
    case "misterioso":
      return (
        <g {...common}>
          <rect x="20" y="30" width="24" height="15" rx="2" />
          <path d="M18 24h28v6H18Z" />
          <path d="M32 24v21" />
          <path d="M32 24c-3-6-9-4-9 0M32 24c3-6 9-4 9 0" />
        </g>
      );
    case "trono":
      return (
        <g {...common}>
          <path d="M23 22c0-1 1-2 2-2s2 1 2 2v8h10v-8c0-1 1-2 2-2s2 1 2 2v18H23Z" />
          <path d="M23 40v4h18v-4M27 44v3M37 44v3" />
        </g>
      );
    default:
      return (
        <g {...common}>
          <rect x="20" y="26" width="24" height="18" rx="2" />
          <path d="M20 32h24M32 26v18" />
        </g>
      );
  }
}

export function GiftGlyph({
  giftId,
  rarity,
  className,
}: {
  giftId: string;
  rarity: Rarity;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "relative flex items-center justify-center overflow-hidden rounded-xl bg-surface-2 ring-1 ring-inset ring-border",
        className,
      )}
      style={{ color: rarityColorVar[rarity] }}
    >
      {getGift(giftId)?.asset ? (
        <Image src={getGift(giftId)!.asset!} alt="" fill sizes="(max-width: 640px) 42vw, 220px" className="object-contain p-3 transition-transform duration-150 group-hover:scale-[1.03]" />
      ) : (
        <svg viewBox="0 0 64 64" className="size-[64%]" aria-hidden>
          <Glyph id={giftId} />
        </svg>
      )}
    </span>
  );
}
