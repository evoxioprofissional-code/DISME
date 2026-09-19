import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes with conditional logic, deduping conflicts. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** 12480 -> "12.480" (pt-BR grouping, used for Flex / counts). */
export function formatNumber(n: number) {
  return new Intl.NumberFormat("pt-BR").format(n);
}

/** 12480 -> "12,5 mil" for compact tiles. */
export function formatCompact(n: number) {
  if (n < 1000) return String(n);
  return new Intl.NumberFormat("pt-BR", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);
}

/** Days-together / streak style label. */
export function pluralDays(n: number) {
  return `${formatNumber(n)} ${n === 1 ? "dia" : "dias"}`;
}

/** Serial number display: 42, 1000 -> "#0042 / 1000". */
export function serial(index: number, total: number) {
  const pad = String(total).length;
  return `#${String(index).padStart(pad, "0")} / ${total}`;
}

/** Compact pt-BR relative time: "agora", "8 min", "3 h", "2 d", "12 mar". */
export function timeAgo(iso: string) {
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  const m = Math.round(diff / 60_000);
  if (m < 1) return "agora";
  if (m < 60) return `${m} min`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} h`;
  const d = Math.round(h / 24);
  if (d < 7) return `${d} d`;
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

/** Long pt-BR date: "12 de março". */
export function longDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "long" });
}

/** Countdown from now to an ISO instant: "14h 32min". */
export function countdown(iso: string) {
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return "encerrado";
  const totalMin = Math.floor(diff / 60_000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h >= 24) {
    const d = Math.floor(h / 24);
    return `${d}d ${h % 24}h`;
  }
  return `${h}h ${String(m).padStart(2, "0")}min`;
}
