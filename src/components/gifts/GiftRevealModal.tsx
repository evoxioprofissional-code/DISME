"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { X } from "lucide-react";
import type { Gift } from "@/types";
import { cn } from "@/lib/utils";
import { GiftGlyph } from "./GiftGlyph";
import { RarityTag } from "@/components/ui/RarityTag";

export interface RevealAction {
  label: string;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary";
}

export function GiftRevealModal({
  gift,
  eyebrow,
  title,
  description,
  actions,
  onClose,
}: {
  gift: Gift;
  eyebrow: string;
  title: string;
  description?: string;
  actions: RevealAction[];
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <motion.div
        className="absolute inset-0 bg-black/80"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        role="dialog"
        aria-label={title}
        className="relative w-full max-w-sm rounded-3xl border border-border bg-surface p-7 text-center"
        initial={{ scale: 0.94, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 26 }}
      >
        <button
          onClick={onClose}
          aria-label="Fechar"
          className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-full text-text-secondary hover:bg-surface-2"
        >
          <X className="size-5" />
        </button>

        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.05 }}
          className="mx-auto"
        >
          <GiftGlyph giftId={gift.id} rarity={gift.rarity} className="mx-auto size-28" />
        </motion.div>

        <div className="mt-3 flex justify-center">
          <RarityTag rarity={gift.rarity} />
        </div>

        <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-brand">{eyebrow}</p>
        <h2 className="mt-1 text-2xl font-extrabold tracking-tight">{title}</h2>
        {description && (
          <p className="mx-auto mt-2 max-w-[17rem] text-sm text-text-secondary">{description}</p>
        )}

        <div className="mt-6 space-y-2.5">
          {actions.map((a, i) => {
            const cls = cn(
              "flex h-12 w-full items-center justify-center rounded-full text-sm font-bold transition-colors",
              a.variant === "secondary"
                ? "bg-surface-3 font-semibold text-text hover:bg-hover"
                : "bg-brand text-on-brand hover:bg-brand-hover",
            );
            return a.href ? (
              <Link key={i} href={a.href} className={cls}>
                {a.label}
              </Link>
            ) : (
              <button key={i} onClick={a.onClick} className={cls}>
                {a.label}
              </button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
