import { cn } from "@/lib/utils";
import type { PresenceState } from "@/types";

const color: Record<PresenceState, string> = {
  online: "bg-online",
  ausente: "bg-gold",
  ocupado: "bg-danger",
  offline: "bg-muted",
};

const label: Record<PresenceState, string> = {
  online: "Online",
  ausente: "Ausente",
  ocupado: "Ocupado",
  offline: "Offline",
};

export function PresenceDot({
  state,
  className,
  ring = true,
}: {
  state: PresenceState;
  className?: string;
  ring?: boolean;
}) {
  return (
    <span
      role="img"
      aria-label={label[state]}
      className={cn(
        "inline-block size-2.5 rounded-full",
        color[state],
        ring && "ring-2 ring-surface",
        className,
      )}
    />
  );
}

export { label as presenceLabel };
