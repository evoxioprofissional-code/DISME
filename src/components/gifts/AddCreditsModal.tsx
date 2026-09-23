"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "motion/react";
import { Check, Coins, Copy, X } from "lucide-react";
import { CREDIT_PACKAGES, type CreditPackageId } from "@/lib/payments/credit-packages";
import { cn, formatBrl, formatNumber } from "@/lib/utils";

type Step = "packages" | "pix" | "done";

type PixCharge = {
  purchaseId: string;
  packageId: string;
  name: string;
  credits: number;
  amountBrl: number;
  pixCopiaCola: string | null;
  qrCodeSrc: string | null;
  expiresAt: string | null;
};

export function AddCreditsModal({
  onClose,
  onCredited,
}: {
  onClose: () => void;
  onCredited: (balance: number) => void;
}) {
  const [step, setStep] = useState<Step>("packages");
  const [selected, setSelected] = useState<CreditPackageId | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [charge, setCharge] = useState<PixCharge | null>(null);
  const [copied, setCopied] = useState(false);
  const [expired, setExpired] = useState(false);

  const poll = useCallback(async (purchaseId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/payments/nexuspag/${purchaseId}`, { cache: "no-store" });
      if (!response.ok) return true;
      const data = (await response.json()) as {
        status?: string;
        balance?: number;
        credits?: number;
      };
      if (data.status === "paid") {
        setStep("done");
        if (typeof data.balance === "number") onCredited(data.balance);
        return false;
      }
      if (data.status === "expired" || data.status === "failed") {
        setExpired(true);
        return false;
      }
      return true;
    } catch {
      return true;
    }
  }, [onCredited]);

  useEffect(() => {
    if (step !== "pix" || !charge || expired) return;
    let stopped = false;
    let timer: number | undefined;
    const tick = async () => {
      if (charge.expiresAt && new Date(charge.expiresAt).getTime() <= Date.now()) {
        setExpired(true);
        return;
      }
      const shouldContinue = await poll(charge.purchaseId);
      if (!stopped && shouldContinue) timer = window.setTimeout(tick, 8000);
    };
    void tick();
    return () => {
      stopped = true;
      if (timer) window.clearTimeout(timer);
    };
  }, [step, charge, expired, poll]);

  async function buy(packageId: CreditPackageId) {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/payments/nexuspag/pix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId }),
      });
      const data = (await response.json()) as PixCharge & { error?: string };
      if (!response.ok) {
        setError(data.error ?? "Não foi possível gerar o PIX. Tente de novo.");
        return;
      }
      setCharge(data);
      setExpired(false);
      setStep("pix");
    } catch {
      setError("Não foi possível gerar o PIX. Tente de novo.");
    } finally {
      setBusy(false);
    }
  }

  async function copyPix() {
    if (!charge?.pixCopiaCola) return;
    try {
      await navigator.clipboard.writeText(charge.pixCopiaCola);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setError("Não deu para copiar. Selecione o código manualmente.");
    }
  }

  const title =
    step === "packages" ? "Adicionar créditos" : step === "pix" ? "Finalize o pagamento" : "Pagamento confirmado";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <motion.div
        className="absolute inset-0 bg-black/70"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        role="dialog"
        aria-label={title}
        className="relative flex max-h-[90dvh] w-full flex-col overflow-hidden rounded-t-3xl border border-border bg-surface sm:max-w-md sm:rounded-3xl"
        initial={{ y: "100%", opacity: 0.6 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0.6 }}
        transition={{ type: "spring", stiffness: 320, damping: 34 }}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-lg font-extrabold">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="flex size-8 items-center justify-center rounded-full text-text-secondary hover:bg-surface-2"
          >
            <X className="size-5" />
          </button>
        </div>

        {step === "packages" && (
          <div className="flex-1 space-y-2 overflow-y-auto px-5 py-4">
            {CREDIT_PACKAGES.map((pkg) => {
              const active = selected === pkg.id;
              return (
                <button
                  key={pkg.id}
                  type="button"
                  onClick={() => setSelected(pkg.id)}
                  aria-pressed={active}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition-colors",
                    active
                      ? "border-border-strong bg-surface-2"
                      : "border-border bg-surface-2/60 hover:border-border-strong hover:bg-surface-2",
                  )}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-extrabold tracking-wide text-text">{pkg.name}</p>
                      {pkg.popular && (
                        <span className="rounded-full bg-surface-3 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-text-secondary">
                          Popular
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-text-secondary">
                      <Coins className="size-3.5 text-gold" />
                      {formatNumber(pkg.credits)} créditos
                    </p>
                  </div>
                  <p className="tnum shrink-0 text-sm font-bold text-text">{formatBrl(pkg.amountBrl)}</p>
                </button>
              );
            })}
            {error && <p className="pt-1 text-sm text-danger">{error}</p>}
          </div>
        )}

        {step === "pix" && charge && (
          <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
            {charge.qrCodeSrc && (
              <div className="mx-auto w-fit rounded-2xl border border-border bg-white p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={charge.qrCodeSrc} alt="QR Code PIX" className="size-44" />
              </div>
            )}
            <div className="rounded-2xl bg-surface-2 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Valor</p>
              <p className="tnum text-lg font-extrabold text-text">{formatBrl(charge.amountBrl)}</p>
              <p className="mt-1 flex items-center gap-1 text-sm text-text-secondary">
                <Coins className="size-3.5 text-gold" />
                {formatNumber(charge.credits)} créditos · {charge.name}
              </p>
            </div>
            {charge.pixCopiaCola && (
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">PIX copia e cola</p>
                <p className="break-all rounded-2xl bg-surface-2 px-3 py-2 font-mono text-[11px] leading-relaxed text-text-secondary">
                  {charge.pixCopiaCola}
                </p>
                <button
                  type="button"
                  onClick={() => void copyPix()}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-surface-3 py-3 text-sm font-bold text-text hover:bg-hover"
                >
                  {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                  {copied ? "Código copiado" : "Copiar código PIX"}
                </button>
              </div>
            )}
            <p className="text-center text-sm text-text-secondary">
              {expired ? "PIX expirado. Feche e gere outro." : "Aguardando pagamento"}
            </p>
            {charge.expiresAt && !expired && (
              <p className="text-center text-xs text-muted">
                Expira em {new Date(charge.expiresAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
              </p>
            )}
            {error && <p className="text-sm text-danger">{error}</p>}
          </div>
        )}

        {step === "done" && charge && (
          <div className="flex-1 px-5 py-8 text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-muted">Créditos adicionados</p>
            <p className="mt-2 flex items-center justify-center gap-2 text-2xl font-extrabold text-text">
              <Coins className="size-6 text-gold" />
              + {formatNumber(charge.credits)}
            </p>
          </div>
        )}

        {step === "packages" && (
          <div className="border-t border-border px-5 py-4">
            <button
              type="button"
              disabled={!selected || busy}
              onClick={() => selected && void buy(selected)}
              className="w-full rounded-full bg-brand py-3 text-sm font-bold text-on-brand transition-colors hover:bg-brand-hover disabled:opacity-40"
            >
              {busy ? "Gerando PIX..." : "Continuar"}
            </button>
          </div>
        )}

        {step === "done" && (
          <div className="border-t border-border px-5 py-4">
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-full bg-brand py-3 text-sm font-bold text-on-brand hover:bg-brand-hover"
            >
              Pronto
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
