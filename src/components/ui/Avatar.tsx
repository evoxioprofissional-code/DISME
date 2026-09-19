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
} as const;

type Size = keyof typeof sizes;

export function Avatar({
  src,
  name,
  size = "md",
  presence,
  className,
  rounded = "full",
}: {
  src: string;
  name: string;
  size?: Size;
  presence?: PresenceState;
  className?: string;
  rounded?: "full" | "xl";
}) {
  const px = sizes[size];
  const dot =
    size === "xs" || size === "sm"
      ? "size-2.5 -bottom-0 -right-0"
      : "size-3.5 bottom-0.5 right-0.5";

  return (
    <span
      className={cn("relative inline-block shrink-0", className)}
      style={{ width: px, height: px }}
    >
      <Image
        src={src}
        alt={name}
        width={px}
        height={px}
        className={cn(
          "size-full object-cover bg-surface-3",
          rounded === "full" ? "rounded-full" : "rounded-lg",
        )}
      />
      {presence && (
        <PresenceDot
          state={presence}
          ring={false}
          className={cn(
            "absolute rounded-full ring-[3px] ring-bg",
            dot,
          )}
        />
      )}
    </span>
  );
}
