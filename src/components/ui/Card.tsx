import { cn } from "@/lib/utils";

export function Card({
  className,
  interactive,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { interactive?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-surface",
        interactive && "transition-colors hover:border-border-strong hover:bg-surface-2",
        className,
      )}
      {...props}
    />
  );
}
