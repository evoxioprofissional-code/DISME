import Image from "next/image";
import { cn } from "@/lib/utils";
import type { PresenceState } from "@/types";
import { PresenceDot } from "./PresenceDot";

const sizes = {
  xs: 28,
  sm: 36,
  md: 44,
  lg: 56,
  xl: 72,
  "2xl": 96,
  "3xl": 116,
} as const;

type Size = keyof typeof sizes;

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return (parts[0]?.[0] ?? "?").toUpperCase();
}

export function Avatar({
  src,
  name,
  size = "md",
  presence,
  className,
  rounded = "full",
  priority = false,
}: {
  src?: string | null;
  name: string;
  size?: Size;
  presence?: PresenceState;
  className?: string;
  rounded?: "full" | "xl";
  priority?: boolean;
}) {
  const px = sizes[size];
  const dot =
    size === "xs" || size === "sm"
      ? "size-2.5 -bottom-0 -right-0"
      : size === "3xl"
        ? "size-4 bottom-1 right-1"
        : "size-3.5 bottom-0.5 right-0.5";
  const radius = rounded === "full" ? "rounded-full" : "rounded-lg";

  return (
    <span
      className={cn("relative inline-block shrink-0", className)}
      style={{ width: px, height: px }}
    >
      {src ? (
        <Image
          src={src}
          alt={name}
          width={px}
          height={px}
          priority={priority}
          className={cn("size-full bg-surface-3 object-cover", radius)}
        />
      ) : (
        <span
          aria-label={name}
          className={cn(
            "flex size-full items-center justify-center bg-surface-3 font-bold text-text-secondary",
            radius,
          )}
          style={{ fontSize: px * 0.4 }}
        >
          {initials(name)}
        </span>
      )}
      {presence && (
        <PresenceDot
          state={presence}
          ring={false}
          className={cn("absolute rounded-full ring-[3px] ring-bg", dot)}
        />
      )}
    </span>
  );
}
