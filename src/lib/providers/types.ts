export type HistoryField = "username" | "display_name" | "avatar" | "banner";

export interface HistoryObservation {
  field: HistoryField;
  value: string;
  assetUrl: string | null;
  assetHash: string | null;
  observedAt: string;
  firstSeenAt?: string | null;
  lastSeenAt?: string | null;
  source: "discord" | "oathnet" | "namedc" | "disme";
}

export interface ProviderResult {
  status: "disabled" | "ok" | "empty" | "not_found" | "unauthorized" | "no_queries" | "rate_limited" | "unavailable" | "error";
  observations: HistoryObservation[];
}

export function observationKey(observation: Pick<HistoryObservation, "field" | "value" | "assetHash">) {
  return [observation.field, observation.assetHash ?? observation.value].join(":");
}