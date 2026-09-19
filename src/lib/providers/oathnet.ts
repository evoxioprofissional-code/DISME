import "server-only";
import { discordAvatarUrl, discordBannerUrl } from "@/lib/discord";
import type { HistoryObservation, ProviderResult } from "./types";

const OATHNET_BASE_URL = "https://oathnet.org/api/service";
const TIMEOUT_MS = 8_000;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringValue(value: unknown) {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function stringArray(value: unknown) {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === "string" && item.length > 0);
  const item = stringValue(value);
  return item ? [item] : [];
}

function observationsFrom(payload: unknown): HistoryObservation[] {
  if (!isRecord(payload) || !isRecord(payload.data) || !Array.isArray(payload.data.history)) return [];
  return payload.data.history.flatMap((entry): HistoryObservation[] => {
    if (!isRecord(entry)) return [];
    const names = stringArray(entry.name);
    const times = stringArray(entry.time);
    return names.map((name, index) => ({
      field: "username",
      value: name,
      assetUrl: null,
      assetHash: null,
      observedAt: times[index] && !Number.isNaN(Date.parse(times[index])) ? times[index] : new Date().toISOString(),
      source: "oathnet",
    }));
  });
}

export async function fetchOathNetHistory(discordUserId: string, apiKey?: string): Promise<ProviderResult> {
  if (!apiKey) return { status: "disabled", observations: [] };
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(
      `${OATHNET_BASE_URL}/discord-username-history?discord_id=${encodeURIComponent(discordUserId)}`,
      {
        headers: { Accept: "application/json", "x-api-key": apiKey },
        cache: "no-store",
        redirect: "error",
        signal: controller.signal,
      },
    );
    if (response.status === 401 || response.status === 403) return { status: "unauthorized", observations: [] };
    if (response.status === 404) return { status: "not_found", observations: [] };
    if (response.status === 429) return { status: "rate_limited", observations: [] };
    if (!response.ok || !response.headers.get("content-type")?.toLowerCase().includes("json")) {
      return { status: "unavailable", observations: [] };
    }
    const payload: unknown = await response.json().catch(() => null);
    const observations = observationsFrom(payload);
    return { status: observations.length ? "ok" : "empty", observations };
  } catch {
    return { status: "unavailable", observations: [] };
  } finally {
    clearTimeout(timeout);
  }
}

export function oathNetUserInfoObservations(payload: unknown, discordUserId: string, observedAt: string): HistoryObservation[] {
  if (!isRecord(payload) || !isRecord(payload.data)) return [];
  const user = isRecord(payload.data.user) ? payload.data.user : payload.data;
  const observations: HistoryObservation[] = [];
  const username = stringValue(user.username);
  const displayName = stringValue(user.global_name) ?? stringValue(user.display_name);
  const avatar = stringValue(user.avatar);
  const banner = stringValue(user.banner);
  if (username) observations.push({ field: "username", value: username, assetUrl: null, assetHash: username, observedAt, source: "oathnet" });
  if (displayName) observations.push({ field: "display_name", value: displayName, assetUrl: null, assetHash: displayName, observedAt, source: "oathnet" });
  if (avatar) observations.push({ field: "avatar", value: avatar, assetUrl: discordAvatarUrl(discordUserId, avatar), assetHash: avatar, observedAt, source: "oathnet" });
  if (banner) observations.push({ field: "banner", value: banner, assetUrl: discordBannerUrl(discordUserId, banner), assetHash: banner, observedAt, source: "oathnet" });
  return observations;
}