import Link from "next/link";
import { PageContainer } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Mark } from "@/components/brand/Mark";
import { buttonClasses } from "@/components/ui/Button";

/** Placeholder for sections shipping in a later stage. In-world copy, no dev jargon. */
export function SectionStub({
  title,
  subtitle,
  line,
  cta,
}: {
  title: string;
  subtitle?: string;
  line: string;
  cta?: { label: string; href: string };
}) {
  return (
    <PageContainer>
      <PageHeader title={title} subtitle={subtitle} />
      <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border-strong bg-surface/50 px-6 py-20 text-center">
        <span className="flex size-16 items-center justify-center rounded-2xl bg-surface-3">
          <Mark className="size-9 opacity-60" variant="mono" />
        </span>
        <p className="max-w-sm text-sm text-text-secondary">{line}</p>
        {cta && (
          <Link href={cta.href} className={buttonClasses({ variant: "secondary", size: "sm" })}>
            {cta.label}
          </Link>
        )}
      </div>
    </PageContainer>
  );
}
