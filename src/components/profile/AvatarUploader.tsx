"use client";

import { useRef, useState } from "react";
import { Camera, Loader2 } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/utils";

export function AvatarUploader({
  value,
  name,
  onUploaded,
  prominent = false,
}: {
  value?: string | null;
  name: string;
  onUploaded: (url: string) => void;
  prominent?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function upload(file?: File) {
    if (!file || uploading) return;
    setUploading(true);
    setError("");
    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/profile/avatar", { method: "POST", body });
      const result = (await response.json()) as { avatarUrl?: string; error?: string };
      if (!response.ok || !result.avatarUrl) throw new Error(result.error ?? "Não foi possível enviar a foto.");
      onUploaded(result.avatarUrl);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Não foi possível enviar a foto.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className={cn("flex flex-col", prominent ? "items-center gap-3" : "items-start gap-2")}>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="sr-only"
        onChange={(event) => upload(event.target.files?.[0])}
        aria-label="Selecionar foto de perfil"
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className={cn(
          "group relative inline-flex rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:cursor-wait",
          prominent && "rounded-full",
        )}
        aria-label={value ? "Trocar foto de perfil" : "Adicionar foto de perfil"}
      >
        <Avatar
          src={value}
          name={name || "Seu perfil"}
          size="2xl"
          rounded={prominent ? "full" : "xl"}
          className={cn("ring-4 ring-surface", !prominent && "rounded-2xl")}
        />
        <span className="absolute -bottom-1 -right-1 flex size-9 items-center justify-center rounded-full bg-brand text-on-brand ring-2 ring-surface transition-colors group-hover:bg-brand-hover">
          {uploading ? <Loader2 className="size-4 animate-spin" /> : <Camera className="size-4" />}
        </span>
      </button>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className={cn(
          "text-sm font-semibold text-brand hover:text-brand-hover disabled:opacity-60",
          !prominent && "mt-1",
        )}
      >
        {uploading
          ? "Enviando foto..."
          : value
            ? "Trocar foto de perfil"
            : "Adicionar foto de perfil"}
      </button>
      {error && <p role="alert" className={cn("text-xs font-medium text-danger", prominent && "text-center")}>{error}</p>}
    </div>
  );
}
