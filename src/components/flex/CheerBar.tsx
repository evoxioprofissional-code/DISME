"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/** Social-only cheering. No stakes, no prizes — just picking a side. */
export function CheerBar({ nameA, nameB }: { nameA: string; nameB: string }) {
  const [side, setSide] = useState<"a" | "b" | null>(null);

  return (
    <div className="grid grid-cols-2 gap-3">
      {(
        [
          ["a", nameA],
          ["b", nameB],
        ] as const
      ).map(([key, name]) => {
        const active = side === key;
        return (
          <button
            key={key}
            onClick={() => setSide(active ? null : key)}
            aria-pressed={active}
            className={cn(
              "flex h-12 items-center justify-center gap-2 rounded-full text-sm font-bold transition-colors",
              active
                ? "bg-brand text-on-brand"
                : "border border-border-strong text-text hover:bg-surface-2",
            )}
          >
            {active && <Check className="size-4" />}
            {active ? "Torcendo" : `Torcer por ${name}`}
          </button>
        );
      })}
    </div>
  );
}
