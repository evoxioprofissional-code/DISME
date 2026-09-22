"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { Camera, Loader2 } from "lucide-react";

export function BannerUploader({ value, onUploaded }: { value?: string; onUploaded: (url: string) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  async function upload(file?: File) {
    if (!file || uploading) return;
    setUploading(true); setError("");
    try {
      const body = new FormData(); body.append("file", file);
      const response = await fetch("/api/profile/banner", { method: "POST", body });
      const result = await response.json() as { bannerUrl?: string; error?: string };
      if (!response.ok || !result.bannerUrl) throw new Error(result.error ?? "Não foi possível enviar a capa.");
      onUploaded(result.bannerUrl);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Não foi possível enviar a capa."); }
    finally { setUploading(false); if (input.current) input.current.value = ""; }
  }
  return (
    <div>
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="sr-only" onChange={(event) => upload(event.target.files?.[0])} />
      <div className="relative h-36 overflow-hidden bg-surface-2 sm:h-44">
        {value && <Image src={value} alt="Sua capa" fill sizes="720px" className="object-cover" />}
        <button type="button" onClick={() => input.current?.click()} disabled={uploading} className="absolute right-3 top-3 flex h-9 items-center gap-2 rounded-full bg-[#0a0a0de6] px-3.5 text-xs font-bold text-white transition-colors hover:bg-black disabled:opacity-60">
          {uploading ? <Loader2 className="size-4 animate-spin" /> : <Camera className="size-4" />}
          {uploading ? "Enviando" : value ? "Trocar capa" : "Adicionar capa"}
        </button>
      </div>
      {error && <p role="alert" className="px-5 pt-2 text-xs font-semibold text-danger">{error}</p>}
    </div>
  );
}
