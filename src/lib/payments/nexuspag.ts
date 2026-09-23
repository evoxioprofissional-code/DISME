import "server-only";
import { getNexuspagWebhookUrl } from "./app-url";

const NEXUSPAG_BASE = "https://nexuspag.com";
const PIX_TIMEOUT_MS = 15_000;

export type NexuspagPixTransaction = {
  id: string;
  txid?: string;
  external_id?: string | null;
  amount: number;
  status: string;
  pix_copia_cola?: string;
  qr_code_base64?: string;
  expires_at?: string;
  paid_at?: string | null;
};

export type NexuspagCreateResult =
  | { ok: true; status: number; transaction: NexuspagPixTransaction }
  | { ok: false; status: number; code: "unauthorized" | "rate_limited" | "timeout" | "unavailable" | "invalid" };

export type NexuspagGetResult =
  | { ok: true; transaction: NexuspagPixTransaction }
  | { ok: false; status: number; code: "unauthorized" | "not_found" | "timeout" | "unavailable" };

function apiKey(): string {
  const key = process.env.NEXUSPAG_API_KEY;
  if (!key) throw new Error("NexusPag is not configured");
  return key;
}

async function nexuspagFetch(path: string, init: RequestInit): Promise<Response> {
  return fetch(`${NEXUSPAG_BASE}${path}`, {
    ...init,
    headers: {
      "x-api-key": apiKey(),
      ...(init.headers ?? {}),
    },
    cache: "no-store",
    signal: AbortSignal.timeout(PIX_TIMEOUT_MS),
  });
}

function asTransaction(value: unknown): NexuspagPixTransaction | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (
    typeof row.id !== "string" ||
    row.id.length === 0 ||
    typeof row.amount !== "number" ||
    !Number.isFinite(row.amount) ||
    typeof row.status !== "string"
  ) {
    return null;
  }
  return {
    id: row.id,
    txid: typeof row.txid === "string" ? row.txid : undefined,
    external_id: typeof row.external_id === "string" ? row.external_id : row.external_id === null ? null : undefined,
    amount: row.amount,
    status: row.status,
    pix_copia_cola: typeof row.pix_copia_cola === "string" ? row.pix_copia_cola : undefined,
    qr_code_base64: typeof row.qr_code_base64 === "string" ? row.qr_code_base64 : undefined,
    expires_at: typeof row.expires_at === "string" ? row.expires_at : undefined,
    paid_at: typeof row.paid_at === "string" ? row.paid_at : row.paid_at === null ? null : undefined,
  };
}

export async function createNexuspagPix(input: {
  amountBrl: number;
  description: string;
  externalId: string;
  expirationSeconds?: number;
}): Promise<NexuspagCreateResult> {
  const webhookUrl = getNexuspagWebhookUrl();
  const body: Record<string, unknown> = {
    amount: Number(input.amountBrl.toFixed(2)),
    description: input.description,
    external_id: input.externalId,
    expiration: input.expirationSeconds ?? 1800,
  };
  if (webhookUrl) body.webhook_url = webhookUrl;

  let response: Response;
  try {
    response = await nexuspagFetch("/api/pix/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (error) {
    if (error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError")) {
      return { ok: false, status: 504, code: "timeout" };
    }
    return { ok: false, status: 502, code: "unavailable" };
  }

  if (response.status === 401) return { ok: false, status: 401, code: "unauthorized" };
  if (response.status === 429) return { ok: false, status: 429, code: "rate_limited" };
  if (response.status >= 500) return { ok: false, status: 502, code: "unavailable" };
  if (!response.ok && response.status !== 200 && response.status !== 201) {
    return { ok: false, status: 400, code: "invalid" };
  }

  let parsed: unknown;
  try {
    parsed = await response.json();
  } catch {
    return { ok: false, status: 502, code: "unavailable" };
  }

  const envelope = parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : null;
  const transaction = asTransaction(envelope?.transaction);
  if (!transaction) return { ok: false, status: 502, code: "unavailable" };
  return { ok: true, status: response.status, transaction };
}

export async function getNexuspagPix(id: string): Promise<NexuspagGetResult> {
  let response: Response;
  try {
    response = await nexuspagFetch(`/api/pix/${encodeURIComponent(id)}`, { method: "GET" });
  } catch (error) {
    if (error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError")) {
      return { ok: false, status: 504, code: "timeout" };
    }
    return { ok: false, status: 502, code: "unavailable" };
  }

  if (response.status === 401) return { ok: false, status: 401, code: "unauthorized" };
  if (response.status === 404) return { ok: false, status: 404, code: "not_found" };
  if (!response.ok) return { ok: false, status: 502, code: "unavailable" };

  let parsed: unknown;
  try {
    parsed = await response.json();
  } catch {
    return { ok: false, status: 502, code: "unavailable" };
  }

  const transaction = asTransaction(parsed);
  if (!transaction) return { ok: false, status: 502, code: "unavailable" };
  return { ok: true, transaction };
}

export function qrCodeSrc(value: string | undefined): string | null {
  if (!value) return null;
  if (value.startsWith("data:image/")) return value;
  return `data:image/png;base64,${value}`;
}
