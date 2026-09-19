"use client";

import { useState } from "react";
import type { RankingCategory, RankingEntry } from "@/types";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { categoryMeta, RankingRow, TopThree } from "./parts";

const ORDER: RankingCategory[] = [
  "flex",
  "presenteados",
  "colecionadores",
  "casais",
  "streaks",
];

export function RankingBoard({
  data,
  initial = "flex",
}: {
  data: Record<RankingCategory, RankingEntry[]>;
  initial?: RankingCategory;
}) {
  const [active, setActive] = useState<RankingCategory>(initial);
  const entries = data[active];
  const unit = categoryMeta[active].unit;
  const hasSpotlight = entries.length >= 3;
  const listEntries = hasSpotlight ? entries.slice(3) : entries;

  return (
    <div>
      <div className="no-scrollbar -mx-4 mb-5 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        {ORDER.map((cat) => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors",
              active === cat
                ? "bg-brand text-on-brand"
                : "bg-surface-2 text-text-secondary hover:bg-hover hover:text-text",
            )}
          >
            {categoryMeta[cat].short}
          </button>
        ))}
      </div>

      {entries.length === 0 && (
        <p className="rounded-2xl border border-dashed border-border-strong bg-surface/50 px-4 py-8 text-center text-sm text-text-secondary">
          Ainda não há gente suficiente nesse ranking.
        </p>
      )}

      {hasSpotlight && <TopThree entries={entries} unit={unit} />}

      {listEntries.length > 0 && (
        <Card className={cn("divide-y divide-border overflow-hidden", hasSpotlight && "mt-4")}>
          {listEntries.map((entry) => (
            <RankingRow key={`${active}-${entry.rank}`} entry={entry} unit={unit} />
          ))}
        </Card>
      )}
    </div>
  );
}
