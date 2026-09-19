"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { X, Check } from "lucide-react";
import { cn } from "@/lib/utils";

type RelType = "namorando" | "webnamoro";

const OPTIONS: { key: RelType; label: string; hint: string }[] = [
  { key: "namorando", label: "Namoro", hint: "Oficial dentro do DisMe" },
  { key: "webnamoro", label: "Webnamoro", hint: "À distância, mas de verdade" },
];

export function RelationshipModal({
  displayName,
  onClose,
  onSend,
}: {
  displayName: string;
  onClose: () => void;
  onSend: (type: RelType, message: string) => void | Promise<void>;
}) {
  const [type, setType] = useState<RelType>("namorando");
  const [message, setMessage] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <motion.div
        className="absolute inset-0 bg-black/70"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        role="dialog"
        aria-label="Solicitar relacionamento"
        className="relative w-full overflow-hidden rounded-t-3xl border border-border bg-surface sm:max-w-sm sm:rounded-3xl"
        initial={{ y: "100%", opacity: 0.6 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0.6 }}
        transition={{ type: "spring", stiffness: 320, damping: 34 }}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-lg font-extrabold">Solicitar relacionamento</h2>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="flex size-8 items-center justify-center rounded-full text-text-secondary hover:bg-surface-2"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="space-y-5 px-5 py-5">
          <p className="text-sm text-text-secondary">
            Escolha o tipo de relacionamento que você quer pedir para{" "}
            <span className="font-bold text-text">{displayName}</span>.
          </p>

          <div className="grid grid-cols-2 gap-3">
            {OPTIONS.map((o) => {
              const active = type === o.key;
              return (
                <button
                  key={o.key}
                  onClick={() => setType(o.key)}
                  className={cn(
                    "rounded-2xl border p-4 text-left transition-colors",
                    active
                      ? "border-brand bg-brand-tint"
                      : "border-border bg-surface-2 hover:bg-hover",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-text">{o.label}</span>
                    {active && <Check className="size-4 text-brand" />}
                  </div>
                  <p className="mt-1 text-xs text-muted">{o.hint}</p>
                </button>
              );
            })}
          </div>

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={2}
            maxLength={140}
            placeholder="Escreva um pedido (opcional)"
            className="w-full resize-none rounded-2xl bg-surface-2 px-4 py-3 text-sm text-text placeholder:text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          />

          <button
            onClick={() => onSend(type, message)}
            className="w-full rounded-full bg-brand py-3 text-sm font-bold text-on-brand transition-colors hover:bg-brand-hover"
          >
            Enviar pedido
          </button>
        </div>
      </motion.div>
    </div>
  );
}
