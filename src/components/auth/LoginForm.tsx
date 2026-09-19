"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { signUpEmail } from "@/lib/actions";
import { Wordmark } from "@/components/brand/Wordmark";
import { DiscordIcon } from "@/components/icons/Discord";
import { cn } from "@/lib/utils";

export function LoginForm() {
  const router = useRouter();
  const supabase = createClient();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onEmail(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "signup") {
        const res = await signUpEmail(email, password);
        if (!res.ok) {
          setError(res.error ?? "Não foi possível criar a conta.");
          return;
        }
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          setError(error.message);
          return;
        }
        router.push("/onboarding");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          setError("E-mail ou senha incorretos.");
          return;
        }
        router.push("/home");
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function onDiscord() {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "discord",
      options: { redirectTo: `${location.origin}/auth/callback` },
    });
    if (error) setError("Login com Discord ainda não está ativo.");
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <Wordmark priority className="!h-9" />
          <h1 className="mt-8 text-2xl font-extrabold leading-tight tracking-tight">
            {mode === "signin" ? "Entrar no DisMe" : "Criar sua conta"}
          </h1>
          <p className="mt-2 text-[15px] text-text-secondary">
            A rede social feita pra sua vibe no Discord.
          </p>
        </div>

        <button
          onClick={onDiscord}
          className="mb-3 flex h-13 w-full items-center justify-center gap-2.5 rounded-full bg-brand text-[15px] font-bold text-on-brand transition-colors hover:bg-brand-hover"
        >
          <DiscordIcon className="size-5" />
          Continuar com Discord
        </button>

        <div className="my-4 flex items-center gap-3 text-xs text-muted">
          <span className="h-px flex-1 bg-border" />
          ou
          <span className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={onEmail} className="space-y-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="E-mail"
            className={inputCls}
          />
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Senha"
            className={inputCls}
          />
          {error && <p className="text-sm font-medium text-danger">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="flex h-13 w-full items-center justify-center gap-2 rounded-full border border-border-strong text-[15px] font-semibold text-text transition-colors hover:bg-surface-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="size-5 animate-spin" /> : <Mail className="size-5" />}
            {mode === "signin" ? "Entrar com e-mail" : "Criar conta"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-text-secondary">
          {mode === "signin" ? "Ainda não tem conta?" : "Já tem conta?"}{" "}
          <button
            onClick={() => {
              setMode(mode === "signin" ? "signup" : "signin");
              setError(null);
            }}
            className="font-bold text-brand hover:underline"
          >
            {mode === "signin" ? "Criar conta" : "Entrar"}
          </button>
        </p>

        <div className="mt-8 flex items-center justify-center gap-2">
          <span className="rounded-full border border-border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-text-secondary">
            18+
          </span>
          <p className="text-xs text-muted">Você precisa ter 18 anos ou mais para entrar.</p>
        </div>
      </div>
    </main>
  );
}

const inputCls = cn(
  "h-13 w-full rounded-2xl bg-surface-2 px-4 text-[15px] text-text placeholder:text-muted",
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand",
);
