import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { amountsMatch, getCreditPackage } from "@/lib/payments/credit-packages";
import { getNexuspagPix } from "@/lib/payments/nexuspag";

type FulfillOk = {
  ok: true;
  alreadyCredited: boolean;
  creditsAdded: number;
  balance: number;
  purchaseId: string;
};

type FulfillErr = {
  ok: false;
  code: "not_found" | "amount_mismatch" | "unconfirmed" | "unavailable";
};

type PurchaseRow = {
  id: string;
  user_id: string;
  package_id: string;
  credits: number;
  amount_brl: number | string;
  external_id: string;
  provider_payment_id: string | null;
  credited_at: string | null;
};

export async function confirmAndFulfillPurchase(input: {
  externalId?: string | null;
  providerPaymentId?: string | null;
  webhookAmount?: number;
}): Promise<FulfillOk | FulfillErr> {
  const admin = createAdminClient();
  let purchase: PurchaseRow | null = null;

  if (input.externalId) {
    const { data } = await admin
      .from("credit_purchases")
      .select("id, user_id, package_id, credits, amount_brl, external_id, provider_payment_id, credited_at")
      .eq("external_id", input.externalId)
      .maybeSingle();
    purchase = data as PurchaseRow | null;
  }
  if (!purchase && input.providerPaymentId) {
    const { data } = await admin
      .from("credit_purchases")
      .select("id, user_id, package_id, credits, amount_brl, external_id, provider_payment_id, credited_at")
      .eq("provider_payment_id", input.providerPaymentId)
      .maybeSingle();
    purchase = data as PurchaseRow | null;
  }
  if (!purchase) return { ok: false, code: "not_found" };

  if (input.externalId && input.externalId !== purchase.external_id) {
    return { ok: false, code: "not_found" };
  }

  const pkg = getCreditPackage(purchase.package_id);
  const storedCredits = Number(purchase.credits);
  const storedAmount = Number(purchase.amount_brl);
  if (
    !pkg ||
    storedCredits !== pkg.credits ||
    !amountsMatch(storedAmount, pkg.amountBrl)
  ) {
    return { ok: false, code: "amount_mismatch" };
  }
  if (input.webhookAmount != null && !amountsMatch(input.webhookAmount, storedAmount)) {
    return { ok: false, code: "amount_mismatch" };
  }
  if (
    purchase.provider_payment_id &&
    input.providerPaymentId &&
    purchase.provider_payment_id !== input.providerPaymentId
  ) {
    return { ok: false, code: "not_found" };
  }

  if (purchase.credited_at) {
    const { data: profile } = await admin.from("profiles").select("credits").eq("id", purchase.user_id).maybeSingle();
    return {
      ok: true,
      alreadyCredited: true,
      creditsAdded: storedCredits,
      balance: Number(profile?.credits ?? 0),
      purchaseId: purchase.id,
    };
  }

  const lookupId = input.providerPaymentId || purchase.provider_payment_id || purchase.external_id;
  const remote = await getNexuspagPix(lookupId);
  if (!remote.ok) {
    if (remote.code === "not_found") return { ok: false, code: "not_found" };
    return { ok: false, code: "unavailable" };
  }

  if (remote.transaction.status !== "paid") {
    return { ok: false, code: "unconfirmed" };
  }
  if (!amountsMatch(remote.transaction.amount, storedAmount)) {
    return { ok: false, code: "amount_mismatch" };
  }
  if (remote.transaction.external_id !== purchase.external_id) {
    return { ok: false, code: "not_found" };
  }
  if (
    (input.providerPaymentId && remote.transaction.id !== input.providerPaymentId) ||
    (purchase.provider_payment_id && remote.transaction.id !== purchase.provider_payment_id)
  ) {
    return { ok: false, code: "not_found" };
  }

  const { data, error: rpcError } = await admin.rpc("fulfill_credit_purchase", {
    p_external_id: purchase.external_id,
    p_provider_payment_id: remote.transaction.id,
    p_expected_amount: purchase.amount_brl,
    p_paid_at: remote.transaction.paid_at ?? new Date().toISOString(),
  });

  if (rpcError) {
    const message = rpcError.message.toLowerCase();
    if (message.includes("not found")) return { ok: false, code: "not_found" };
    if (message.includes("amount mismatch")) return { ok: false, code: "amount_mismatch" };
    return { ok: false, code: "unavailable" };
  }

  const result = data as {
    ok?: boolean;
    already_credited?: boolean;
    credits_added?: number;
    balance?: number;
    purchase_id?: string;
  };

  return {
    ok: true,
    alreadyCredited: Boolean(result.already_credited),
    creditsAdded: Number(result.credits_added ?? storedCredits),
    balance: Number(result.balance ?? 0),
    purchaseId: String(result.purchase_id ?? purchase.id),
  };
}
