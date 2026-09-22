"use client";

import Image from "next/image";
import { useActionState, useRef, useState } from "react";
import { Camera, Loader2, Store as StoreIcon } from "lucide-react";
import { saveStore, type StoreFormState } from "@/lib/marketplace-actions";
import type { MarketplaceStore } from "@/types/marketplace";
import { Button } from "@/components/ui/Button";

const initialState: StoreFormState = {};
const inputClass = "h-11 w-full rounded-xl border border-border-strong bg-bg px-3.5 text-sm text-text placeholder:text-muted focus:border-brand focus:outline-none";
const labelClass = "mb-2 block text-sm font-bold text-text";

export function StoreForm({ store, username }: { store?: MarketplaceStore | null; username: string }) {
  const [avatar, setAvatar] = useState(store?.avatar ?? "");
  const [banner, setBanner] = useState(store?.banner ?? "");
  const [uploading, setUploading] = useState<"avatar" | "banner" | null>(null);
  const [uploadError, setUploadError] = useState("");
  const avatarInput = useRef<HTMLInputElement>(null);
  const bannerInput = useRef<HTMLInputElement>(null);
  const [state, action, pending] = useActionState(saveStore, initialState);

  async function upload(file: File | undefined, type: "avatar" | "banner") {
    if (!file || uploading) return;
    setUploading(type); setUploadError("");
    try {
      const body = new FormData(); body.append("file", file);
      const response = await fetch("/api/store/media", { method: "POST", body });
      const result = await response.json() as { url?: string; error?: string };
      if (!response.ok || !result.url) throw new Error(result.error ?? "Não foi possível enviar a imagem.");
      if (type === "avatar") setAvatar(result.url); else setBanner(result.url);
    } catch (reason) { setUploadError(reason instanceof Error ? reason.message : "Não foi possível enviar a imagem."); }
    finally { setUploading(null); }
  }

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="avatar_url" value={avatar} />
      <input type="hidden" name="banner_url" value={banner} />
      <input ref={avatarInput} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="sr-only" onChange={(event) => upload(event.target.files?.[0], "avatar")} />
      <input ref={bannerInput} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="sr-only" onChange={(event) => upload(event.target.files?.[0], "banner")} />

      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="relative h-36 bg-surface-2">
          {banner ? <Image src={banner} alt="Capa da loja" fill sizes="760px" className="object-cover" /> : <div className="flex size-full items-center justify-center text-muted"><StoreIcon className="size-10" strokeWidth={1.4} /></div>}
          <button type="button" onClick={() => bannerInput.current?.click()} className="absolute right-3 top-3 flex h-9 items-center gap-2 rounded-full bg-[#0a0a0de6] px-3.5 text-xs font-bold text-white">
            {uploading === "banner" ? <Loader2 className="size-4 animate-spin" /> : <Camera className="size-4" />} {banner ? "Trocar capa" : "Adicionar capa"}
          </button>
        </div>
        <div className="relative px-5 pb-5">
          <button type="button" onClick={() => avatarInput.current?.click()} className="relative -mt-9 flex size-[76px] items-center justify-center overflow-hidden rounded-2xl bg-surface-3 ring-4 ring-surface">
            {avatar ? <Image src={avatar} alt="Logo da loja" fill sizes="76px" className="object-cover" /> : <StoreIcon className="size-7 text-muted" />}
            <span className="absolute inset-0 flex items-center justify-center bg-black/45 opacity-0 transition-opacity hover:opacity-100"><Camera className="size-5 text-white" /></span>
          </button>
          <button type="button" onClick={() => avatarInput.current?.click()} className="mt-2 text-xs font-bold text-brand">{avatar ? "Trocar logo" : "Adicionar logo"}</button>
        </div>
      </div>
      {uploadError && <p role="alert" className="text-sm font-semibold text-danger">{uploadError}</p>}

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="sm:col-span-2"><span className={labelClass}>Nome da loja</span><input name="name" required minLength={3} maxLength={60} defaultValue={store?.name ?? `Loja de ${username}`} className={inputClass} /></label>
        <label className="sm:col-span-2"><span className={labelClass}>Endereço da loja</span><div className="flex"><span className="flex h-11 items-center rounded-l-xl border border-r-0 border-border-strong bg-surface-2 px-3 text-xs text-muted">disme.cloud/store/</span><input name="slug" required minLength={3} maxLength={30} defaultValue={store?.slug ?? username} className={`${inputClass} rounded-l-none`} /></div></label>
        <label className="sm:col-span-2"><span className={labelClass}>Descrição</span><textarea name="description" maxLength={500} rows={5} defaultValue={store?.description} className="w-full resize-y rounded-xl border border-border-strong bg-bg px-3.5 py-3 text-sm leading-6 text-text placeholder:text-muted focus:border-brand focus:outline-none" placeholder="Conte o que as pessoas encontram na sua loja." /></label>
        <label className="sm:col-span-2 flex items-start gap-3 rounded-xl border border-border bg-surface p-4"><input type="checkbox" name="is_published" defaultChecked={store?.isPublished ?? true} className="mt-1 size-4 accent-brand" /><span><span className="block text-sm font-bold text-text">Loja pública</span><span className="mt-0.5 block text-xs leading-5 text-text-secondary">Aparece no Marketplace e pode ser acessada pelo seu perfil.</span></span></label>
      </div>
      {state.error && <p role="alert" className="rounded-xl border border-danger/30 bg-danger-tint px-4 py-3 text-sm font-semibold text-danger">{state.error}</p>}
      <div className="flex justify-end border-t border-border pt-5"><Button type="submit" size="lg" disabled={pending || Boolean(uploading)}>{pending && <Loader2 className="size-4 animate-spin" />}{pending ? "Salvando..." : store ? "Salvar loja" : "Criar minha loja"}</Button></div>
    </form>
  );
}
