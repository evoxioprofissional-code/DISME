import { Mark } from "@/components/brand/Mark";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border-strong bg-surface/50 px-6 py-16 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-surface-3">
        <Mark className="size-8 opacity-60" variant="mono" />
      </span>
      <div className="max-w-sm">
        <h3 className="text-base font-bold text-text">{title}</h3>
        {description && (
          <p className="mt-1 text-sm text-text-secondary">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
