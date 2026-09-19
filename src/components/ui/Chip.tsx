import { cn } from "@/lib/utils";

type Variant = "default" | "brand" | "outline" | "solid";

const variants: Record<Variant, string> = {
  default: "bg-surface-3 text-text-secondary",
  brand: "bg-brand-tint text-brand ring-1 ring-inset ring-brand/25",
  outline: "border border-border text-text-secondary",
  solid: "bg-surface-2 text-text",
};

export function Chip({
  children,
  variant = "default",
  className,
  icon,
}: {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
  icon?: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        variants[variant],
        className,
      )}
    >
      {icon && <span className="shrink-0 [&>svg]:size-3.5">{icon}</span>}
      {children}
    </span>
  );
}
