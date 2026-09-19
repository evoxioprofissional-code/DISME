import Link from "next/link";
import { LogIn } from "lucide-react";
import { Mark } from "@/components/brand/Mark";
import { buttonClasses } from "@/components/ui/Button";

/** Shown on personal pages when a visitor isn't signed in. */
export function LoginCta({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border-strong bg-surface/50 px-6 py-16 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-surface-3">
        <Mark className="size-8" variant="mono" />
      </span>
      <div className="max-w-sm">
        <h3 className="text-base font-bold text-text">{title}</h3>
        <p className="mt-1 text-sm text-text-secondary">{description}</p>
      </div>
      <Link href="/login" className={buttonClasses({ size: "md", className: "gap-2" })}>
        <LogIn className="size-4" />
        Entrar ou criar conta
      </Link>
    </div>
  );
}
