import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

const MAX_SKEW_SECONDS = 300;

export function parseWebhookSignature(header: string | null): { t: string; v1: string } | null {
  if (!header) return null;
  const fields: Record<string, string> = {};
  for (const part of header.split(",")) {
    const idx = part.indexOf("=");
    if (idx <= 0) continue;
    fields[part.slice(0, idx).trim()] = part.slice(idx + 1).trim();
  }
  if (!fields.t || !fields.v1) return null;
  if (!/^\d{1,12}$/.test(fields.t)) return null;
  if (!/^[0-9a-fA-F]{64}$/.test(fields.v1)) return null;
  return { t: fields.t, v1: fields.v1 };
}

export function isWebhookTimestampFresh(timestampSeconds: string, nowMs = Date.now()): boolean {
  const ts = Number(timestampSeconds);
  if (!Number.isSafeInteger(ts) || ts <= 0) return false;
  return Math.abs(nowMs / 1000 - ts) <= MAX_SKEW_SECONDS;
}

export function verifyNexuspagWebhookSignature(params: {
  rawBody: string;
  signatureHeader: string | null;
  secret: string;
  nowMs?: number;
}): boolean {
  const parsed = parseWebhookSignature(params.signatureHeader);
  if (!parsed) return false;
  if (!isWebhookTimestampFresh(parsed.t, params.nowMs)) return false;

  const expectedHex = createHmac("sha256", params.secret)
    .update(`${parsed.t}.${params.rawBody}`)
    .digest("hex");

  const received = Buffer.from(parsed.v1, "hex");
  const expected = Buffer.from(expectedHex, "hex");
  if (received.length === 0 || received.length !== expected.length) return false;
  return timingSafeEqual(received, expected);
}
