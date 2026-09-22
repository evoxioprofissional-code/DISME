"use client";

import Image from "next/image";
import { useActionState, useRef, useState } from "react";
import { Camera, Loader2, ShieldCheck, Store, X } from "lucide-react";
import { createMarketplaceListing, updateMarketplaceListing, type MarketplaceFormState } from "@/lib/marketplace-actions";
import type { MarketplaceListing } from "@/types/marketplace";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const initialState: MarketplaceFormState = {};

const inputClass = "h-11 w-full rounded-xl border border-border-strong bg-bg px-3.5 text-sm text-text placeholder:text-muted focus:border-brand focus:outline-none";
const labelClass = "mb-2 block text-sm font-bold text-text";

export function ListingForm({ initialKind = "market", listing }: { initialKind?: "market" | "showcase"; listing?: MarketplaceListing }) {
  const editing = Boolean(listing);
  const [kind, setKind] = useState<"market" | "showcase">(listing?.kind ?? initialKind);
  const [images, setImages] = useState<string[]>(listing?.images ?? []);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const [state, action, pending] = useActionState(editing ? updateMarketplaceListing : createMarketplaceListing, initialState);

  async function upload(files: FileList | null) {
    if (!files?.length || uploading) return;
    const selected = Array.from(files).slice(0, 5 - images.length);
    setUploading(true);
    setUploadError("");
    try {
      const next: string[] = [];
      for (const file of selected) {
        const body = new FormData();
        body.append("file", file);
        const response = await fetch("/api/marketplace/media", { method: "POST", body });
        const result = (await response.json()) as { url?: string; error?: string };
        if (!response.ok || !result.url) throw new Error(result.error ?? "Falha ao enviar a imagem.");
        next.push(result.url);
      }
      setImages((current) => [...current, ...next].slice(0, 5));
    } catch (reason) {
      setUploadError(reason instanceof Error ? reason.message : "Falha ao enviar a imagem.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="kind" value={kind} />
      <input type="hidden" name="images" value={JSON.stringify(images)} />
      {listing && <input type="hidden" name="listing_id" value={listing.id} />}

      <fieldset>
        <legend className={labelClass}>Tipo de publicação</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setKind("market")}
            className={cn("rounded-2xl border p-4 text-left transition-colors", kind === "market" ? "border-brand bg-brand-tint" : "border-border bg-surface hover:border-border-strong")}
          >
            <Store className={cn("size-5", kind === "market" ? "text-brand" : "text-text-secondary")} />
            <span className="mt-3 block text-sm font-extrabold text-text">Anúncio no Marketplace</span>
            <span className="mt-1 block text-xs leading-5 text-text-secondary">Itens, serviços, periféricos ou colecionáveis transferíveis.</span>
          </button>
          <button
            type="button"
            onClick={() => setKind("showcase")}
            className={cn("rounded-2xl border p-4 text-left transition-colors", kind === "showcase" ? "border-brand bg-brand-tint" : "border-border bg-surface hover:border-border-strong")}
          >
            <ShieldCheck className={cn("size-5", kind === "showcase" ? "text-brand" : "text-text-secondary")} />
            <span className="mt-3 block text-sm font-extrabold text-text">Expor uma conta</span>
            <span className="mt-1 block text-xs leading-5 text-text-secondary">Uma vitrine sem preço, venda, troca ou transferência.</span>
          </button>
        </div>
      </fieldset>

      {kind === "showcase" && (
        <div className="flex gap-3 rounded-xl border border-brand/25 bg-brand-tint p-4 text-sm leading-5 text-text-secondary">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-brand" />
          <p><strong className="text-text">Somente exposição.</strong> A publicação mostrará a história e as características da conta, sem valor e sem ação de compra.</p>
        </div>
      )}

      <div>
        <span className={labelClass}>Imagens <span className="font-normal text-muted">(até 5)</span></span>
        <input ref={fileRef} type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif" className="sr-only" onChange={(event) => upload(event.target.files)} />
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {images.map((url, index) => (
            <div key={url} className="relative aspect-square overflow-hidden rounded-xl border border-border bg-surface-2">
              <Image src={url} alt={`Imagem ${index + 1}`} fill sizes="160px" className="object-cover" />
              <button type="button" onClick={() => setImages((current) => current.filter((item) => item !== url))} aria-label="Remover imagem" className="absolute right-1.5 top-1.5 flex size-7 items-center justify-center rounded-full bg-bg/90 text-text">
                <X className="size-4" />
              </button>
            </div>
          ))}
          {images.length < 5 && (
            <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="flex aspect-square flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border-strong bg-surface text-xs font-semibold text-text-secondary hover:border-brand hover:text-text disabled:opacity-60">
              {uploading ? <Loader2 className="size-5 animate-spin" /> : <Camera className="size-5" />}
              {uploading ? "Enviando" : "Adicionar"}
            </button>
          )}
        </div>
        {uploadError && <p role="alert" className="mt-2 text-xs font-semibold text-danger">{uploadError}</p>}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="sm:col-span-2">
          <span className={labelClass}>Título</span>
          <input name="title" required minLength={4} maxLength={80} defaultValue={listing?.title} className={inputClass} placeholder={kind === "showcase" ? "Conta antiga com badge rara" : "O que você está anunciando?"} />
        </label>
        {kind === "market" && (
          <label>
            <span className={labelClass}>Categoria</span>
            <select name="category" required className={inputClass} defaultValue={listing?.category !== "account_showcase" ? listing?.category : "item"}>
              <option value="item">Itens digitais</option>
              <option value="service">Serviços</option>
              <option value="peripheral">Periféricos</option>
              <option value="collectible">Colecionáveis</option>
            </select>
          </label>
        )}
        <label>
          <span className={labelClass}>Plataforma</span>
          <input name="platform" maxLength={40} defaultValue={listing?.platform} className={inputClass} placeholder="Discord, Steam, Riot..." />
        </label>
        {kind === "market" && (
          <label>
            <span className={labelClass}>Valor</span>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted">R$</span>
              <input name="price" required inputMode="decimal" defaultValue={listing?.priceCents !== undefined ? (listing.priceCents / 100).toFixed(2).replace(".", ",") : undefined} className={`${inputClass} pl-10`} placeholder="0,00" />
            </div>
          </label>
        )}
        {kind === "market" && (
          <label className="sm:col-span-2">
            <span className={labelClass}>Como o item ou serviço é entregue?</span>
            <input name="transfer_method" maxLength={120} defaultValue={listing?.transferMethod} className={inputClass} placeholder="Descreva a forma de entrega sem compartilhar credenciais" />
          </label>
        )}
        <label className="sm:col-span-2">
          <span className={labelClass}>{kind === "showcase" ? "História e características" : "Descrição"}</span>
          <textarea name="description" required minLength={20} maxLength={1600} rows={7} defaultValue={listing?.description} className="w-full resize-y rounded-xl border border-border-strong bg-bg px-3.5 py-3 text-sm leading-6 text-text placeholder:text-muted focus:border-brand focus:outline-none" placeholder={kind === "showcase" ? "Conte quando a conta foi criada, o que ela tem de especial e por que você decidiu exibi-la." : "Inclua estado, detalhes, condições e tudo que o interessado precisa saber."} />
        </label>
        <label className="sm:col-span-2">
          <span className={labelClass}>Tags <span className="font-normal text-muted">(separadas por vírgula)</span></span>
          <input name="tags" maxLength={240} defaultValue={listing?.tags.join(", ")} className={inputClass} placeholder="raro, edição limitada, coleção" />
        </label>
      </div>

      {(state.error || uploadError) && <p role="alert" className="rounded-xl border border-danger/30 bg-danger-tint px-4 py-3 text-sm font-semibold text-danger">{state.error ?? uploadError}</p>}
      <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-md text-xs leading-5 text-muted">O DisMe não processa pagamentos. Nunca compartilhe senha, token ou código de autenticação.</p>
        <Button type="submit" size="lg" disabled={pending || uploading}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : null}
          {pending ? "Salvando..." : editing ? "Salvar alterações" : kind === "showcase" ? "Publicar exposição" : "Publicar produto"}
        </Button>
      </div>
    </form>
  );
}
