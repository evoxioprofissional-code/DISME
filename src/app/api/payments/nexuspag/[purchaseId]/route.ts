import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { confirmAndFulfillPurchase } from "@/lib/payments/fulfill";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ purchaseId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { purchaseId } = await context.params;
  if (!purchaseId) {
    return NextResponse.json({ error: "Compra não encontrada." }, { status: 404 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Entre na sua conta para ver esta compra." }, { status: 401 });
  }

  const { data: purchase } = await supabase
    .from("credit_purchases")
    .select("id, package_id, amount_brl, credits, status, expires_at, credited_at, external_id, provider_payment_id")
    .eq("id", purchaseId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!purchase) {
    return NextResponse.json({ error: "Compra não encontrada." }, { status: 404 });
  }

  const expired =
    purchase.status === "pending" &&
    purchase.expires_at &&
    new Date(purchase.expires_at).getTime() <= Date.now();

  if (purchase.status === "pending" && !expired) {
    const fulfilled = await confirmAndFulfillPurchase({
      externalId: purchase.external_id,
      providerPaymentId: purchase.provider_payment_id,
    });
    if (fulfilled.ok) {
      return NextResponse.json({
        purchaseId: purchase.id,
        packageId: purchase.package_id,
        credits: purchase.credits,
        amountBrl: Number(purchase.amount_brl),
        status: "paid",
        expiresAt: purchase.expires_at,
        creditsAdded: fulfilled.creditsAdded,
        balance: fulfilled.balance,
      });
    }
  }

  const paid = purchase.status === "paid" && Boolean(purchase.credited_at);
  const { data: profile } = paid
    ? await supabase.from("profiles").select("credits").eq("id", user.id).maybeSingle()
    : { data: null };

  return NextResponse.json({
    purchaseId: purchase.id,
    packageId: purchase.package_id,
    credits: purchase.credits,
    amountBrl: Number(purchase.amount_brl),
    status: expired ? "expired" : purchase.status,
    expiresAt: purchase.expires_at,
    credited: Boolean(purchase.credited_at),
    balance: paid ? Number(profile?.credits ?? 0) : undefined,
  });
}
