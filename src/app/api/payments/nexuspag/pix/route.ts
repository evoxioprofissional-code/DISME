import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  amountsMatch,
  getCreditPackage,
  isCreditPackageId,
} from "@/lib/payments/credit-packages";
import { createNexuspagPix, qrCodeSrc } from "@/lib/payments/nexuspag";

export const runtime = "nodejs";

function humanError(code: string): string {
  switch (code) {
    case "unauthorized":
      return "Pagamento indisponível no momento.";
    case "rate_limited":
      return "Muitas tentativas. Espere um pouco.";
    case "timeout":
      return "A NexusPag demorou para responder. Tente de novo.";
    case "unauthenticated":
      return "Entre na sua conta para adicionar créditos.";
    case "invalid_package":
      return "Esse pacote não está disponível.";
    default:
      return "Não foi possível gerar o PIX. Tente de novo.";
  }
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: humanError("unauthenticated") }, { status: 401 });
  }

  let packageId = "";
  try {
    const body = (await request.json()) as { packageId?: unknown };
    packageId = typeof body.packageId === "string" ? body.packageId.trim() : "";
  } catch {
    return NextResponse.json({ error: humanError("invalid_package") }, { status: 400 });
  }

  if (!isCreditPackageId(packageId)) {
    return NextResponse.json({ error: humanError("invalid_package") }, { status: 400 });
  }

  const pkg = getCreditPackage(packageId);
  if (!pkg) {
    return NextResponse.json({ error: humanError("invalid_package") }, { status: 400 });
  }

  const externalId = `disme_${crypto.randomUUID()}`;
  const admin = createAdminClient();
  const { data: purchase, error: insertError } = await admin
    .from("credit_purchases")
    .insert({
      user_id: user.id,
      provider: "nexuspag",
      external_id: externalId,
      package_id: pkg.id,
      amount_brl: pkg.amountBrl,
      credits: pkg.credits,
      status: "pending",
    })
    .select("id")
    .single();

  if (insertError || !purchase) {
    return NextResponse.json({ error: humanError("unavailable") }, { status: 500 });
  }

  const created = await createNexuspagPix({
    amountBrl: pkg.amountBrl,
    description: `DisMe ${pkg.name} · ${pkg.credits} créditos`,
    externalId,
  });

  if (!created.ok) {
    await admin.from("credit_purchases").update({ status: "failed" }).eq("id", purchase.id);
    const status = created.code === "rate_limited" ? 429 : created.code === "timeout" ? 504 : 502;
    return NextResponse.json({ error: humanError(created.code) }, { status });
  }

  if (
    created.transaction.external_id !== externalId ||
    !amountsMatch(created.transaction.amount, pkg.amountBrl) ||
    (!created.transaction.pix_copia_cola && !created.transaction.qr_code_base64)
  ) {
    await admin.from("credit_purchases").update({ status: "failed" }).eq("id", purchase.id);
    return NextResponse.json({ error: humanError("invalid") }, { status: 502 });
  }

  const expiresAt = created.transaction.expires_at ?? null;
  const { error: providerUpdateError } = await admin
    .from("credit_purchases")
    .update({
      provider_payment_id: created.transaction.id,
      expires_at: expiresAt,
    })
    .eq("id", purchase.id);

  if (providerUpdateError) {
    await admin.from("credit_purchases").update({ status: "failed" }).eq("id", purchase.id);
    return NextResponse.json({ error: humanError("unavailable") }, { status: 500 });
  }

  return NextResponse.json({
    purchaseId: purchase.id,
    packageId: pkg.id,
    name: pkg.name,
    credits: pkg.credits,
    amountBrl: pkg.amountBrl,
    pixCopiaCola: created.transaction.pix_copia_cola ?? null,
    qrCodeSrc: qrCodeSrc(created.transaction.qr_code_base64),
    expiresAt,
    status: "pending",
  });
}
