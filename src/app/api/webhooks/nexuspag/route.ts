import { NextResponse } from "next/server";
import { confirmAndFulfillPurchase } from "@/lib/payments/fulfill";
import { verifyNexuspagWebhookSignature } from "@/lib/payments/hmac";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const secret = process.env.NEXUSPAG_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }

  const rawBody = await request.text();
  const signature = request.headers.get("x-webhook-signature") ?? request.headers.get("X-Webhook-Signature");
  if (!verifyNexuspagWebhookSignature({ rawBody, signatureHeader: signature, secret })) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody) as unknown;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!payload || typeof payload !== "object") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const body = payload as Record<string, unknown>;
  const bodyEvent = typeof body.event === "string" ? body.event : null;
  const headerEvent = request.headers.get("x-webhook-event");
  if (bodyEvent && headerEvent && bodyEvent !== headerEvent) {
    return NextResponse.json({ error: "Event mismatch" }, { status: 400 });
  }
  const event = headerEvent ?? bodyEvent;
  if (event !== "payment.confirmed") {
    return NextResponse.json({ received: true });
  }

  const status = typeof body.status === "string" ? body.status : "";
  if (status && status !== "paid") {
    return NextResponse.json({ received: true });
  }

  const externalId = typeof body.external_id === "string" ? body.external_id : null;
  const providerPaymentId = typeof body.transaction_id === "string" ? body.transaction_id : null;
  const amount =
    typeof body.amount === "number" && Number.isFinite(body.amount) && body.amount > 0
      ? body.amount
      : undefined;

  if ((!externalId && !providerPaymentId) || amount === undefined) {
    return NextResponse.json({ error: "Invalid payment payload" }, { status: 400 });
  }

  const result = await confirmAndFulfillPurchase({
    externalId,
    providerPaymentId,
    webhookAmount: amount,
  });

  if (!result.ok) {
    if (result.code === "unconfirmed") {
      return NextResponse.json({ error: "Payment not confirmed" }, { status: 503 });
    }
    if (result.code === "unavailable") {
      return NextResponse.json({ error: "Temporary error" }, { status: 503 });
    }
    if (result.code === "amount_mismatch") {
      return NextResponse.json({ error: "Amount mismatch" }, { status: 409 });
    }
    return NextResponse.json({ error: "Unknown purchase" }, { status: 404 });
  }

  return NextResponse.json({ received: true, alreadyCredited: result.alreadyCredited });
}
