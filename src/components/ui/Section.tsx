import Link from "next/link";

export function Section({
  title,
  action,
  href,
  children,
}: {
  title: string;
  action?: string;
  href?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-bold text-text">{title}</h2>
        {action && href && (
          <Link href={href} className="text-xs font-semibold text-brand hover:underline">
            {action}
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}
