"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import type { Gender, Intent } from "@/types";
import { games as allGames } from "@/data";
import { intentMeta } from "@/lib/labels";
import { cn } from "@/lib/utils";

export interface Filters {
  intents: Intent[];
  genders: Gender[];
  ageMin: number;
  ageMax: number;
  onlineOnly: boolean;
  games: string[];
  interests: string[];
}

export const emptyFilters: Filters = {
  intents: [],
  genders: [],
  ageMin: 18,
  ageMax: 40,
  onlineOnly: false,
  games: [],
  interests: [],
};

const genderLabels: Record<Gender, string> = {
  masculino: "Masculino",
  feminino: "Feminino",
  "nao-binario": "Não-binário",
  outro: "Outro",
};

const topInterests = [
  "música", "anime", "fotografia", "programação", "academia", "séries",
  "gatos", "cosplay", "desenho", "skate", "poesia", "café",
];

function toggle<T>(arr: T[], v: T): T[] {
  return arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2.5">
      <h3 className="text-xs font-bold uppercase tracking-wide text-muted">{title}</h3>
      {children}
    </div>
  );
}

function Toggle({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full px-3 py-1.5 text-sm font-semibold transition-colors",
        active
          ? "bg-brand text-on-brand"
          : "bg-surface-3 text-text-secondary hover:bg-hover hover:text-text",
      )}
    >
      {children}
    </button>
  );
}

export function FilterSheet({
  open,
  value,
  onClose,
  onApply,
}: {
  open: boolean;
  value: Filters;
  onClose: () => void;
  onApply: (f: Filters) => void;
}) {
  const [draft, setDraft] = useState<Filters>(value);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <motion.div
            className="absolute inset-0 bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-label="Filtros"
            className="relative flex max-h-[90dvh] w-full flex-col overflow-hidden rounded-t-3xl border border-border bg-surface sm:max-w-md sm:rounded-3xl"
            initial={{ y: "100%", opacity: 0.6 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0.6 }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="text-lg font-extrabold">Filtros</h2>
              <button
                onClick={onClose}
                aria-label="Fechar"
                className="flex size-8 items-center justify-center rounded-full text-text-secondary hover:bg-surface-2"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
              <Section title="Intenção">
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(intentMeta) as Intent[]).map((i) => (
                    <Toggle
                      key={i}
                      active={draft.intents.includes(i)}
                      onClick={() => setDraft({ ...draft, intents: toggle(draft.intents, i) })}
                    >
                      {intentMeta[i].label}
                    </Toggle>
                  ))}
                </div>
              </Section>

              <Section title={`Idade · ${draft.ageMin}–${draft.ageMax}`}>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={18}
                    max={60}
                    value={draft.ageMin}
                    onChange={(e) =>
                      setDraft({ ...draft, ageMin: Math.min(+e.target.value, draft.ageMax) })
                    }
                    className="h-1.5 w-full accent-brand"
                    aria-label="Idade mínima"
                  />
                  <input
                    type="range"
                    min={18}
                    max={60}
                    value={draft.ageMax}
                    onChange={(e) =>
                      setDraft({ ...draft, ageMax: Math.max(+e.target.value, draft.ageMin) })
                    }
                    className="h-1.5 w-full accent-brand"
                    aria-label="Idade máxima"
                  />
                </div>
              </Section>

              <Section title="Gênero">
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(genderLabels) as Gender[]).map((g) => (
                    <Toggle
                      key={g}
                      active={draft.genders.includes(g)}
                      onClick={() => setDraft({ ...draft, genders: toggle(draft.genders, g) })}
                    >
                      {genderLabels[g]}
                    </Toggle>
                  ))}
                </div>
              </Section>

              <Section title="Jogos">
                <div className="flex flex-wrap gap-2">
                  {allGames.map((g) => (
                    <Toggle
                      key={g.id}
                      active={draft.games.includes(g.id)}
                      onClick={() => setDraft({ ...draft, games: toggle(draft.games, g.id) })}
                    >
                      {g.name}
                    </Toggle>
                  ))}
                </div>
              </Section>

              <Section title="Interesses">
                <div className="flex flex-wrap gap-2">
                  {topInterests.map((i) => (
                    <Toggle
                      key={i}
                      active={draft.interests.includes(i)}
                      onClick={() => setDraft({ ...draft, interests: toggle(draft.interests, i) })}
                    >
                      {i}
                    </Toggle>
                  ))}
                </div>
              </Section>

              <label className="flex cursor-pointer items-center justify-between rounded-2xl bg-surface-2 px-4 py-3">
                <span className="text-sm font-semibold">Online recentemente</span>
                <input
                  type="checkbox"
                  checked={draft.onlineOnly}
                  onChange={(e) => setDraft({ ...draft, onlineOnly: e.target.checked })}
                  className="size-5 accent-brand"
                />
              </label>
            </div>

            <div className="flex items-center gap-3 border-t border-border px-5 py-4">
              <button
                onClick={() => setDraft(emptyFilters)}
                className="rounded-full px-4 py-2.5 text-sm font-semibold text-text-secondary hover:text-text"
              >
                Limpar
              </button>
              <button
                onClick={() => onApply(draft)}
                className="flex-1 rounded-full bg-brand py-2.5 text-sm font-bold text-on-brand transition-colors hover:bg-brand-hover"
              >
                Aplicar filtros
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
