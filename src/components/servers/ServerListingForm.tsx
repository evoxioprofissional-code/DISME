"use client";

import { useActionState } from "react";
import { ExternalLink, Loader2, Radio, ShieldCheck } from "lucide-react";
import { saveDiscordServer, type DiscordServerFormState } from "@/lib/server-directory-actions";
import type { DiscordServerListing } from "@/types/discord-server";
import { Button } from "@/components/ui/Button";

const initial: DiscordServerFormState = {};
const inputClass = "h-11 w-full rounded-xl border border-border-strong bg-bg px-3.5 text-sm text-text placeholder:text-muted focus:border-brand focus:outline-none";
const labelClass = "mb-2 block text-sm font-bold text-text";

export function ServerListingForm({ server }: { server?: DiscordServerListing }) {
  const [state, action, pending] = useActionState(saveDiscordServer, initial);
  return (
    <form action={action} className="space-y-6">
      <div className="flex gap-3 rounded-xl border border-brand/25 bg-brand-tint p-4"><ShieldCheck className="mt-0.5 size-5 shrink-0 text-brand" /><div><p className="text-sm font-bold text-text">Anúncio verificado pelo Discord</p><p className="mt-1 text-xs leading-5 text-text-secondary">O ID da sua conta será comparado ao dono oficial do servidor. O bot DisMe precisa estar no servidor para importar as informações.</p></div></div>
      <label><span className={labelClass}>ID do servidor</span><input name="guild_id" required pattern="[0-9]{17,20}" maxLength={20} defaultValue={server?.guildId} readOnly={Boolean(server)} className={`${inputClass} font-mono read-only:text-muted`} placeholder="123456789012345678" /><span className="mt-2 block text-xs text-muted">No Discord, ative o Modo Desenvolvedor, clique com o botão direito no servidor e escolha “Copiar ID do servidor”.</span></label>
      <label><span className={labelClass}>Texto do anúncio</span><textarea name="promo_text" maxLength={700} rows={6} defaultValue={server?.promoText} className="w-full resize-y rounded-xl border border-border-strong bg-bg px-3.5 py-3 text-sm leading-6 text-text placeholder:text-muted focus:border-brand focus:outline-none" placeholder="Conte para quem é o servidor, o que acontece nele e por que vale entrar." /></label>
      <label><span className={labelClass}>Convite público</span><input name="invite_url" type="url" maxLength={200} defaultValue={server?.inviteUrl} className={inputClass} placeholder="https://discord.gg/seu-convite" /><span className="mt-2 block text-xs text-muted">Use um convite permanente e público. O DisMe não cria convites automaticamente.</span></label>
      <label><span className={labelClass}>Tags <span className="font-normal text-muted">(separadas por vírgula)</span></span><input name="tags" maxLength={240} defaultValue={server?.tags.join(", ")} className={inputClass} placeholder="games, comunidade, arte, programação" /></label>
      <label className="flex items-start gap-3 rounded-xl border border-border bg-surface p-4"><input type="checkbox" name="is_published" defaultChecked={server?.isPublished ?? true} className="mt-1 size-4 accent-brand" /><span><span className="block text-sm font-bold text-text">Servidor público</span><span className="mt-0.5 block text-xs text-text-secondary">Aparece na aba Servidores do Marketplace.</span></span></label>
      {state.error && <div role="alert" className="rounded-xl border border-danger/30 bg-danger-tint p-4"><p className="text-sm font-semibold text-danger">{state.error}</p>{state.inviteUrl && <a href={state.inviteUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex h-10 items-center gap-2 rounded-full bg-brand px-4 text-sm font-bold text-on-brand">Adicionar bot ao servidor <ExternalLink className="size-3.5" /></a>}</div>}
      <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between"><p className="max-w-md text-xs leading-5 text-muted">Membros são exibidos apenas como totais. O DisMe não publica a lista individual de participantes.</p><Button type="submit" size="lg" disabled={pending}>{pending ? <Loader2 className="size-4 animate-spin" /> : <Radio className="size-4" />}{pending ? "Consultando Discord..." : server ? "Salvar e sincronizar" : "Importar servidor"}</Button></div>
    </form>
  );
}
