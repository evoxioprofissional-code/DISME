import { cn } from "@/lib/utils";

/**
 * DisMe mascot mark — a simplified, scalable echo of the logo's head.
 * Used where the full wordmark is too wide (compact nav, empty states, avatars).
 */
export function Mark({
  className,
  variant = "brand",
}: {
  className?: string;
  variant?: "brand" | "light" | "mono";
}) {
  const head =
    variant === "brand"
      ? "var(--color-brand)"
      : variant === "light"
        ? "#f4f4f6"
        : "currentColor";
  const eye = variant === "mono" ? "var(--color-bg)" : "#0a0a0d";

  return (
    <svg
      viewBox="0 0 64 64"
      className={cn("block", className)}
      role="img"
      aria-label="DisMe"
      fill="none"
    >
      <path
        d="M15 11 Q10 13 10 21 L10 40 Q10 54 27 57 Q53 61 55 34 Q57 12 31 8 Q21 7 15 11 Z"
        fill={head}
      />
      {/* top-left notch, mirrors the logo's clipped corner */}
      <path d="M10 21 Q10 13 15 11 L18 18 L10 24 Z" fill="var(--color-bg)" opacity="0.0" />
      <circle cx="26" cy="38" r="5.2" fill={eye} />
      <circle cx="42" cy="38" r="5.2" fill={eye} />
    </svg>
  );
}
