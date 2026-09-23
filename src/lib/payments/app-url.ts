import "server-only";

/** Origem pública HTTPS para webhook_url. Sem fallback para localhost. */
export function getPublicAppOrigin(): string | null {
  const configured = process.env.APP_URL?.trim();
  const vercelProduction = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  const raw = configured || (vercelProduction ? `https://${vercelProduction}` : "");
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:") return null;
    return url.origin;
  } catch {
    return null;
  }
}

export function getNexuspagWebhookUrl(): string | undefined {
  const origin = getPublicAppOrigin();
  return origin ? `${origin}/api/webhooks/nexuspag` : undefined;
}
