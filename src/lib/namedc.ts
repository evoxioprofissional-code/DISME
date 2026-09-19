import "server-only";
import type { HistoryObservation, ProviderResult } from "./providers/types";

export interface NameDcUserSnapshot {
  id: string | null;
  username: string | null;
  displayName: string | null;
  discriminator: string | null;
  avatar: string | null;
  banner: string | null;
  accentColor: string | null;
  publicFlags: number | null;
  flags: number | null;
  avatarDecoration: string | null;
  bannerColor: string | null;
}

export interface NameDcHistoryEntry {
  addedAt: string | null;
  user: NameDcUserSnapshot;
}

export function nameDcAvatarUrl(id: string, value: string | null) {
  if (!value) return null;
  return value.startsWith("http") ? value : `https://cdn.discordapp.com/avatars/${id}/${value}.webp?size=512`;
}

export function nameDcBannerUrl(id: string, value: string | null) {
  if (!value) return null;
  return value.startsWith("http") ? value : `https://cdn.discordapp.com/banners/${id}/${value}.webp?size=1024`;
}

export type NameDcLookup =
  | { status: "disabled" }
  | { status: "not_found" }
  | { status: "unauthorized" }
  | { status: "no_queries" }
  | { status: "rate_limited"; retryAfter: number }
  | { status: "unavailable" }
  | { status: "ok"; id: string | null; history: NameDcHistoryEntry[] };

type JsonRecord = Record<string, unknown>;

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function nullableString(value: unknown) {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function nullableNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function snapshotFrom(value: unknown): NameDcUserSnapshot {
  const user = isRecord(value) ? value : {};
  return {
    id: nullableString(user.id),
    username: nullableString(user.username),
    displayName: nullableString(user.display_name) ?? nullableString(user.global_name),
    discriminator: nullableString(user.discriminator),
    avatar: nullableString(user.avatar),
    banner: nullableString(user.banner),
    accentColor: nullableString(user.accent_color),
    publicFlags: nullableNumber(user.public_flags),
    flags: nullableNumber(user.flags),
    avatarDecoration: nullableString(user.avatar_decoration),
    bannerColor: nullableString(user.banner_color),
  };
}

function historyFrom(value: unknown): NameDcHistoryEntry[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    if (!isRecord(entry)) return [];
    const user = snapshotFrom(entry.User ?? entry.user);
    if (!user.username && !user.displayName && !user.avatar && !user.banner) return [];
    return [{ addedAt: nullableString(entry.addedAt), user }];
  });
}

export async function fetchNameDcHistory(id: string, token?: string): Promise<NameDcLookup> {
  if (!token) return { status: "disabled" };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8_000);
  let response: Response;
  try {
    response = await fetch(`https://api.namedc.org/search?query=${encodeURIComponent(id)}`, {
      headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      cache: "no-store",
      redirect: "error",
      signal: controller.signal,
    });
  } catch {
    return { status: "unavailable" };
  } finally {
    clearTimeout(timeout);
  }

  if (response.status === 404) return { status: "not_found" };
  if (response.status === 401) return { status: "unauthorized" };
  if (response.status === 403) return { status: "no_queries" };
  if (response.status === 429) {
    const retryAfter = Number(response.headers.get("retry-after"));
    return { status: "rate_limited", retryAfter: Number.isFinite(retryAfter) ? retryAfter : 60 };
  }
  if (!response.ok) return { status: "unavailable" };
  if (!response.headers.get("content-type")?.toLowerCase().includes("json")) return { status: "unavailable" };

  const payload: unknown = await response.json().catch(() => null);
  if (!isRecord(payload)) return { status: "unavailable" };

  return {
    status: "ok",
    id: nullableString(payload.id),
    history: historyFrom(payload.userHistory),
  };
}

export async function fetchNameDcProvider(id: string, token?: string): Promise<ProviderResult> {
  const result = await fetchNameDcHistory(id, token);
  if (result.status !== "ok") return { status: result.status === "disabled" ? "disabled" : result.status, observations: [] };
  const observations: HistoryObservation[] = result.history.flatMap((entry) => {
    const observations: HistoryObservation[] = [];
    const observedAt = entry.addedAt && !Number.isNaN(Date.parse(entry.addedAt)) ? entry.addedAt : new Date().toISOString();
    if (entry.user.username) observations.push({ field: "username", value: entry.user.username, assetUrl: null, assetHash: entry.user.username, observedAt, source: "namedc" });
    if (entry.user.displayName) observations.push({ field: "display_name", value: entry.user.displayName, assetUrl: null, assetHash: entry.user.displayName, observedAt, source: "namedc" });
    if (entry.user.avatar) observations.push({ field: "avatar", value: entry.user.avatar, assetUrl: nameDcAvatarUrl(id, entry.user.avatar), assetHash: entry.user.avatar, observedAt, source: "namedc" });
    if (entry.user.banner) observations.push({ field: "banner", value: entry.user.banner, assetUrl: nameDcBannerUrl(id, entry.user.banner), assetHash: entry.user.banner, observedAt, source: "namedc" });
    return observations;
  });
  return { status: observations.length ? "ok" : "empty", observations };
}
