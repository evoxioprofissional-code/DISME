"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { X } from "lucide-react";
import type { User } from "@/types";
import { CrushIcon } from "@/components/icons/Crush";
import { StartConversationButton } from "@/components/messages/StartConversationButton";

export function MatchModal({
  me,
  user,
  viaCrush,
  onClose,
}: {
  me: User;
  user: User;
  viaCrush: boolean;
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
        aria-label="Deu match"
        className="relative w-full max-w-sm text-center"
        initial={{ scale: 0.94, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 26 }}
      >
        <button
          onClick={onClose}
          aria-label="Fechar"
          className="absolute -top-2 right-0 flex size-9 items-center justify-center rounded-full bg-surface-2 text-text-secondary hover:text-text"
        >
          <X className="size-5" />
        </button>

        <div className="mb-7 flex items-center justify-center">
          <motion.div
            initial={{ x: -16, rotate: -6, opacity: 0 }}
            animate={{ x: 0, rotate: -6, opacity: 1 }}
            transition={{ delay: 0.05 }}
            className="relative size-28 overflow-hidden rounded-3xl border-2 border-surface"
          >
            <Image src={me.avatar} alt={me.displayName} fill sizes="112px" className="object-cover" />
          </motion.div>
          <span className="z-10 -mx-4 flex size-12 items-center justify-center rounded-full bg-brand text-on-brand ring-4 ring-bg">
            <CrushIcon className="size-6" />
          </span>
          <motion.div
            initial={{ x: 16, rotate: 6, opacity: 0 }}
            animate={{ x: 0, rotate: 6, opacity: 1 }}
            transition={{ delay: 0.05 }}
            className="relative size-28 overflow-hidden rounded-3xl border-2 border-surface"
          >
            <Image src={user.avatar} alt={user.displayName} fill sizes="112px" className="object-cover" />
          </motion.div>
        </div>

        <p className="text-sm font-semibold uppercase tracking-widest text-brand">
          {viaCrush ? "Crush correspondido" : "Vocês se curtiram"}
        </p>
        <h2 className="mt-1 text-3xl font-extrabold tracking-tight">Deu match.</h2>
        <p className="mx-auto mt-2 max-w-[16rem] text-sm text-text-secondary">
          Você e {user.displayName} querem se conhecer. A call não vai começar sozinha.
        </p>

        <div className="mt-6 space-y-2.5">
          <StartConversationButton
            otherId={user.id}
            showIcon={false}
            className="flex h-12 w-full items-center justify-center rounded-full bg-brand text-sm font-bold text-on-brand transition-colors hover:bg-brand-hover"
          />
          <div className="flex gap-2.5">
            <Link
              href={`/profile/${user.username}`}
              className="flex h-11 flex-1 items-center justify-center rounded-full bg-surface-3 text-sm font-semibold hover:bg-hover"
            >
              Ver perfil
            </Link>
            <button
              onClick={onClose}
              className="flex h-11 flex-1 items-center justify-center rounded-full bg-surface-3 text-sm font-semibold hover:bg-hover"
            >
              Continuar
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
