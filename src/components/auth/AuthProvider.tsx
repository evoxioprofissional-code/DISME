"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { X, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Mark } from "@/components/brand/Mark";
import { DiscordIcon } from "@/components/icons/Discord";

interface AuthGate {
  isAuthed: boolean;
  /** Runs `action` if signed in; otherwise opens the sign-up prompt and returns false. */
  requireAuth: (action?: () => void) => boolean;
}

const Ctx = createContext<AuthGate>({ isAuthed: false, requireAuth: () => false });

export function useAuthGate() {
  return useContext(Ctx);
}

export function AuthProvider({
  isAuthed,
  children,
}: {
  isAuthed: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  const requireAuth = useCallback(
    (action?: () => void) => {
      if (isAuthed) {
        action?.();
        return true;
      }
      setOpen(true);
      return false;
    },
    [isAuthed],
  );

  return (
    <Ctx.Provider value={{ isAuthed, requireAuth }}>
      {children}
      <AnimatePresence>{open && <LoginPrompt onClose={() => setOpen(false)} />}</AnimatePresence>
    </Ctx.Provider>
  );
}

function LoginPrompt({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const supabase = createClient();

  async function onDiscord() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "discord",
      options: {
        redirectTo: `${location.origin}/auth/callback`,
        scopes: "identify email",
      },
    });
    if (error) router.push("/login");
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
      <motion.div
        className="absolute inset-0 bg-black/70"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        role="dialog"
        aria-label="Criar conta"
        className="relative w-full overflow-hidden rounded-t-3xl border border-border bg-surface p-6 text-center sm:max-w-sm sm:rounded-3xl"
        initial={{ y: "100%", opacity: 0.6 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0.6 }}
        transition={{ type: "spring", stiffness: 320, damping: 34 }}
      >
        <button
          onClick={onClose}
          aria-label="Fechar"
          className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-full text-text-secondary hover:bg-surface-2"
        >
          <X className="size-5" />
        </button>

        <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-surface-3">
          <Mark className="size-8" variant="mono" />
        </span>
        <h2 className="mt-4 text-xl font-extrabold tracking-tight">Entre no DisMe pra continuar</h2>
        <p className="mx-auto mt-2 max-w-[17rem] text-sm text-text-secondary">
          Crie sua conta pra curtir, presentear, conversar e mostrar seu Flex.
        </p>

        <div className="mt-6 space-y-2.5">
          <button
            onClick={onDiscord}
            className="flex h-12 w-full items-center justify-center gap-2.5 rounded-full bg-brand text-sm font-bold text-on-brand transition-colors hover:bg-brand-hover"
          >
            <DiscordIcon className="size-5" />
            Continuar com Discord
          </button>
          <button
            onClick={() => router.push("/login")}
            className="flex h-12 w-full items-center justify-center gap-2.5 rounded-full border border-border-strong text-sm font-semibold text-text transition-colors hover:bg-surface-2"
          >
            <Mail className="size-5" />
            Continuar com e-mail
          </button>
        </div>
      </motion.div>
    </div>
  );
}
