"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, Camera, Check } from "lucide-react";
import type { Intent } from "@/types";
import { games as allGames } from "@/data";
import { intentMeta } from "@/lib/labels";
import { cn } from "@/lib/utils";
import { Wordmark } from "@/components/brand/Wordmark";

const INTERESTS = [
  "música", "anime", "fotografia", "lo-fi", "k-pop", "desenho", "setups",
  "academia", "séries", "gatos", "cottagecore", "programação", "skate",
  "poesia", "astrologia", "boba", "cosplay", "trilha",
];

function toggle<T>(arr: T[], v: T): T[] {
  return arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
}

interface Data {
  displayName: string;
  username: string;
  age: string;
  intent: Intent | null;
  interests: string[];
  games: string[];
  showProfile: boolean;
  notifications: boolean;
}

const initial: Data = {
  displayName: "",
  username: "",
  age: "",
  intent: null,
  interests: [],
  games: [],
  showProfile: true,
  notifications: true,
};

export function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [d, setD] = useState<Data>(initial);
  const ageNum = parseInt(d.age, 10);
  const ageValid = !isNaN(ageNum) && ageNum >= 18 && ageNum <= 99;

  const steps = [
    { key: "welcome", valid: true },
    { key: "identity", valid: d.displayName.trim().length >= 2 && d.username.trim().length >= 3 },
    { key: "age", valid: ageValid },
    { key: "intent", valid: d.intent !== null },
    { key: "interests", valid: d.interests.length >= 3 },
    { key: "games", valid: d.games.length >= 1 },
    { key: "photos", valid: true },
    { key: "prefs", valid: true },
    { key: "done", valid: true },
  ];
  const total = steps.length;
  const current = steps[step];
  const isFirst = step === 0;
  const isLast = step === total - 1;

  function next() {
    if (!current.valid) return;
    if (isLast) {
      router.push("/home");
      return;
    }
    setStep((s) => Math.min(s + 1, total - 1));
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-6 py-6">
      {/* Progress */}
      <div className="mb-8 flex items-center gap-3">
        {!isFirst ? (
          <button
            onClick={() => setStep((s) => s - 1)}
            aria-label="Voltar"
            className="flex size-9 shrink-0 items-center justify-center rounded-full text-text-secondary hover:bg-surface-2"
          >
            <ChevronLeft className="size-5" />
          </button>
        ) : (
          <Wordmark className="!h-6" />
        )}
        <div className="flex flex-1 gap-1.5">
          {steps.map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-1 flex-1 rounded-full transition-colors",
                i <= step ? "bg-brand" : "bg-surface-3",
              )}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-1 flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.key}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.18 }}
            className="flex-1"
          >
            {current.key === "welcome" && (
              <div className="flex h-full flex-col justify-center text-center">
                <h1 className="text-3xl font-extrabold tracking-tight">Bem-vindo ao DisMe</h1>
                <p className="mt-3 text-[15px] text-text-secondary">
                  Vamos montar seu perfil em poucos passos. Leva menos de um minuto.
                </p>
                <span className="mx-auto mt-6 rounded-full border border-border px-3 py-1 text-xs font-bold uppercase tracking-wide text-text-secondary">
                  Conteúdo 18+
                </span>
              </div>
            )}

            {current.key === "identity" && (
              <Step title="Como te chamam?" subtitle="Seu nome e @ no DisMe.">
                <Field label="Nome de exibição">
                  <input
                    value={d.displayName}
                    onChange={(e) => setD({ ...d, displayName: e.target.value })}
                    placeholder="Ex: Théo"
                    className={inputCls}
                  />
                </Field>
                <Field label="Nome de usuário">
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted">@</span>
                    <input
                      value={d.username}
                      onChange={(e) =>
                        setD({ ...d, username: e.target.value.replace(/[^a-z0-9_]/gi, "").toLowerCase() })
                      }
                      placeholder="voideh"
                      className={cn(inputCls, "pl-8")}
                    />
                  </div>
                </Field>
              </Step>
            )}

            {current.key === "age" && (
              <Step title="Quantos anos você tem?" subtitle="O DisMe é uma plataforma 18+.">
                <Field label="Idade">
                  <input
                    type="number"
                    inputMode="numeric"
                    min={18}
                    max={99}
                    value={d.age}
                    onChange={(e) => setD({ ...d, age: e.target.value })}
                    placeholder="18"
                    className={inputCls}
                  />
                </Field>
                {d.age && !ageValid && (
                  <p className="text-sm font-medium text-danger">
                    Você precisa ter 18 anos ou mais para usar o DisMe.
                  </p>
                )}
              </Step>
            )}

            {current.key === "intent" && (
              <Step title="O que você procura?" subtitle="Dá pra mudar depois.">
                <div className="grid grid-cols-2 gap-3">
                  {(Object.keys(intentMeta) as Intent[]).map((i) => (
                    <button
                      key={i}
                      onClick={() => setD({ ...d, intent: i })}
                      className={cn(
                        "rounded-2xl border p-4 text-left transition-colors",
                        d.intent === i
                          ? "border-brand bg-brand-tint"
                          : "border-border bg-surface-2 hover:bg-hover",
                      )}
                    >
                      <span className="font-bold text-text">{intentMeta[i].label}</span>
                    </button>
                  ))}
                </div>
              </Step>
            )}

            {current.key === "interests" && (
              <Step title="Seus interesses" subtitle="Escolha pelo menos 3.">
                <div className="flex flex-wrap gap-2">
                  {INTERESTS.map((i) => (
                    <Toggle key={i} active={d.interests.includes(i)} onClick={() => setD({ ...d, interests: toggle(d.interests, i) })}>
                      {i}
                    </Toggle>
                  ))}
                </div>
              </Step>
            )}

            {current.key === "games" && (
              <Step title="O que você joga?" subtitle="Escolha pelo menos 1.">
                <div className="flex flex-wrap gap-2">
                  {allGames.map((g) => (
                    <Toggle key={g.id} active={d.games.includes(g.id)} onClick={() => setD({ ...d, games: toggle(d.games, g.id) })}>
                      {g.name}
                    </Toggle>
                  ))}
                </div>
              </Step>
            )}

            {current.key === "photos" && (
              <Step title="Adicione uma foto" subtitle="Perfis com foto recebem mais matches.">
                <div className="flex flex-col items-center gap-4 py-4">
                  <button className="flex size-32 flex-col items-center justify-center gap-2 rounded-full border-2 border-dashed border-border-strong text-muted transition-colors hover:border-brand hover:text-brand">
                    <Camera className="size-7" />
                    <span className="text-xs font-semibold">Adicionar</span>
                  </button>
                  <p className="text-center text-xs text-muted">Você pode adicionar mais fotos depois.</p>
                </div>
              </Step>
            )}

            {current.key === "prefs" && (
              <Step title="Preferências" subtitle="Ajuste como você aparece.">
                <SwitchRow
                  label="Mostrar meu perfil em Descobrir"
                  checked={d.showProfile}
                  onChange={(v) => setD({ ...d, showProfile: v })}
                />
                <SwitchRow
                  label="Receber notificações"
                  checked={d.notifications}
                  onChange={(v) => setD({ ...d, notifications: v })}
                />
              </Step>
            )}

            {current.key === "done" && (
              <div className="flex h-full flex-col justify-center text-center">
                <span className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full bg-brand text-on-brand">
                  <Check className="size-8" strokeWidth={2.6} />
                </span>
                <h1 className="text-3xl font-extrabold tracking-tight">Tudo pronto</h1>
                <p className="mt-3 text-[15px] text-text-secondary">
                  {d.displayName ? `Boa, ${d.displayName}. ` : ""}Seu perfil está no ar. Bora
                  conhecer gente.
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <button
          onClick={next}
          disabled={!current.valid}
          className="mt-6 h-13 w-full rounded-full bg-brand text-[15px] font-bold text-on-brand transition-colors hover:bg-brand-hover disabled:opacity-40"
        >
          {isLast ? "Entrar no DisMe" : isFirst ? "Começar" : "Continuar"}
        </button>
      </div>
    </main>
  );
}

const inputCls =
  "h-13 w-full rounded-2xl bg-surface-2 px-4 text-[15px] text-text placeholder:text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-brand";

function Step({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
      {subtitle && <p className="mt-1.5 text-[15px] text-text-secondary">{subtitle}</p>}
      <div className="mt-6 space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-muted">{label}</span>
      {children}
    </label>
  );
}

function Toggle({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full px-3.5 py-2 text-sm font-semibold transition-colors",
        active ? "bg-brand text-on-brand" : "bg-surface-2 text-text-secondary hover:bg-hover hover:text-text",
      )}
    >
      {children}
    </button>
  );
}

function SwitchRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between rounded-2xl bg-surface-2 px-4 py-3.5 text-left"
    >
      <span className="text-sm font-semibold text-text">{label}</span>
      <span className={cn("relative h-6 w-10 shrink-0 rounded-full transition-colors", checked ? "bg-brand" : "bg-surface-3")}>
        <span className={cn("absolute top-0.5 size-5 rounded-full bg-white transition-all", checked ? "left-[18px]" : "left-0.5")} />
      </span>
    </button>
  );
}
