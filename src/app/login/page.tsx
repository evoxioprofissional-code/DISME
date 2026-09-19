import Link from "next/link";
import { Mail } from "lucide-react";
import { Wordmark } from "@/components/brand/Wordmark";
import { DiscordIcon } from "@/components/icons/Discord";

export default function LoginPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-10 flex flex-col items-center text-center">
          <Wordmark priority className="!h-9" />
          <h1 className="mt-8 text-2xl font-extrabold leading-tight tracking-tight">
            A rede social feita
            <br />
            pra sua vibe no Discord.
          </h1>
          <p className="mt-3 text-[15px] text-text-secondary">
            Descubra pessoas, dê match, colecione presentes e mostre seu Flex.
          </p>
        </div>

        <div className="space-y-3">
          <Link
            href="/onboarding"
            className="flex h-13 w-full items-center justify-center gap-2.5 rounded-full bg-brand py-3.5 text-[15px] font-bold text-on-brand transition-colors hover:bg-brand-hover"
          >
            <DiscordIcon className="size-5" />
            Continuar com Discord
          </Link>
          <Link
            href="/onboarding"
            className="flex h-13 w-full items-center justify-center gap-2.5 rounded-full border border-border-strong py-3.5 text-[15px] font-semibold text-text transition-colors hover:bg-surface-2"
          >
            <Mail className="size-5" />
            Continuar com e-mail
          </Link>
        </div>

        <div className="mt-8 flex items-center justify-center gap-2">
          <span className="rounded-full border border-border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-text-secondary">
            18+
          </span>
          <p className="text-xs text-muted">Você precisa ter 18 anos ou mais para entrar.</p>
        </div>

        <p className="mt-6 text-center text-xs leading-relaxed text-muted">
          Ao continuar, você concorda com os{" "}
          <span className="text-text-secondary underline underline-offset-2">Termos</span> e a{" "}
          <span className="text-text-secondary underline underline-offset-2">
            Política de Privacidade
          </span>{" "}
          do DisMe.
        </p>
      </div>
    </main>
  );
}
