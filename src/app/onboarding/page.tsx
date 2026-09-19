import Link from "next/link";
import { Wordmark } from "@/components/brand/Wordmark";
import { buttonClasses } from "@/components/ui/Button";

export default function OnboardingPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 py-12 text-center">
      <div className="w-full max-w-sm">
        <Wordmark priority className="!h-8" />
        <h1 className="mt-8 text-2xl font-extrabold tracking-tight">Bem-vindo ao DisMe</h1>
        <p className="mt-3 text-[15px] text-text-secondary">
          A configuração do seu perfil — identidade, intenção, interesses e jogos — chega na
          próxima etapa. Por enquanto, dê uma olhada no produto.
        </p>
        <Link
          href="/home"
          className={buttonClasses({ size: "lg", className: "mt-8 w-full" })}
        >
          Entrar no DisMe
        </Link>
      </div>
    </main>
  );
}
