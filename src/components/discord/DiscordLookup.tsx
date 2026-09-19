"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";
import {
  Bot,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  Copy,
  Download,
  ExternalLink,
  Flame,
  Gem,
  Gavel,
  Handshake,
  Hash,
  Heart,
  History,
  Bug,
  Code,
  ScanSearch,
  Scale,
  ShieldCheck,
  Sparkles,
  Star,
  Terminal,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { DiscordLookupResult } from "@/types/discord";

function formatDate(value: string, includeTime = false) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    ...(includeTime ? { timeStyle: "short" as const } : {}),
  }).format(new Date(value));
}

function accountAge(value: string) {
  const created = new Date(value);
  const now = new Date();
  let years = now.getFullYear() - created.getFullYear();
  let months = now.getMonth() - created.getMonth();
  if (now.getDate() < created.getDate()) months -= 1;
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  if (years > 0) return `${years} ${years === 1 ? "ano" : "anos"} e ${months} ${months === 1 ? "mês" : "meses"}`;
  return `${months} ${months === 1 ? "mês" : "meses"}`;
}

const badgeIcons = { shield: ShieldCheck, handshake: Handshake, sparkles: Sparkles, bug: Bug, flame: Flame, gem: Gem, scale: Scale, heart: Heart, bot: Bot, code: Code, gavel: Gavel, terminal: Terminal };

const chipClass = "inline-flex items-center gap-1.5 rounded-full bg-surface-3 px-3 py-1.5 text-xs font-semibold text-text-secondary";

export function DiscordLookup() {
  const [id, setId] = useState("");
  const [result, setResult] = useState<DiscordLookupResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const response = await fetch("/api/discord/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = (await response.json()) as DiscordLookupResult & { error?: string };
      if (!response.ok) throw new Error(data.error || "Não foi possível concluir a consulta.");
      setResult(data);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível concluir a consulta.");
    } finally {
      setLoading(false);
    }
  }

  async function copyId() {
    if (!result) return;
    await navigator.clipboard.writeText(result.user.id);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="space-y-5">
      <form onSubmit={submit} className="border-y border-border bg-surface px-4 py-5 sm:rounded-2xl sm:border">
        <label htmlFor="discord-id" className="block text-sm font-bold text-text">
          ID do usuário
        </label>
        <p className="mt-1 text-sm text-text-secondary">
          Cole o identificador numérico. A consulta usa somente informações públicas do Discord.
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <div className="relative min-w-0 flex-1">
            <ScanSearch className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted" />
            <input
              id="discord-id"
              name="discord-id"
              value={id}
              onChange={(event) => setId(event.target.value.replace(/\D/g, "").slice(0, 20))}
              inputMode="numeric"
              autoComplete="off"
              placeholder="Ex.: 1550785894838181940"
              className="h-12 w-full rounded-xl border border-border-strong bg-bg pl-12 pr-4 font-mono text-sm text-text outline-none transition-colors placeholder:text-muted focus:border-brand"
              aria-describedby="discord-id-help"
            />
          </div>
          <Button type="submit" size="lg" disabled={loading || id.length < 17} className="sm:min-w-36">
            {loading ? "Consultando..." : "Consultar"}
          </Button>
        </div>
        <p id="discord-id-help" className="mt-3 text-xs leading-relaxed text-muted">
          No Discord, ative o Modo Desenvolvedor, clique com o botão direito no usuário e escolha “Copiar ID do usuário”.
        </p>
      </form>

      {error && (
        <div role="alert" className="rounded-xl border border-danger/40 bg-danger-tint px-4 py-3 text-sm text-text">
          {error}
        </div>
      )}

      {loading && <LookupSkeleton />}
      {result && <LookupResult result={result} copied={copied} onCopy={copyId} />}
    </div>
  );
}

function LookupResult({
  result,
  copied,
  onCopy,
}: {
  result: DiscordLookupResult;
  copied: boolean;
  onCopy: () => void;
}) {
  const { user, history } = result;
  return (
    <div className="overflow-hidden border-y border-border bg-surface sm:rounded-2xl sm:border">
      <div
        className="relative h-28 bg-surface-3 sm:h-40"
        style={!user.bannerUrl && user.accentColor ? { backgroundColor: `#${user.accentColor.toString(16).padStart(6, "0")}` } : undefined}
      >
        {user.bannerUrl && <Image src={user.bannerUrl} alt="" fill sizes="(max-width: 768px) 100vw, 768px" className="object-cover" priority />}
      </div>

      <div className="px-4 pb-6 sm:px-7">
        <div className="flex items-end justify-between gap-4">
          <div className="relative -mt-10 size-24 shrink-0 rounded-full border-4 border-surface bg-surface-3 sm:-mt-12 sm:size-28">
            <Image src={user.avatarUrl} alt={`Avatar de ${user.displayName || user.username}`} fill sizes="112px" className="rounded-full object-cover" />
            {user.avatarDecorationUrl && (
              <Image src={user.avatarDecorationUrl} alt="" fill sizes="112px" className="pointer-events-none scale-[1.18] object-contain" />
            )}
          </div>
          {user.avatarHash && (
            <div className="mb-1 flex items-center gap-2">
              <a
                href={user.avatarUrl}
                target="_blank"
                rel="noreferrer"
                title="Visualizar avatar original"
                className="inline-flex size-10 items-center justify-center rounded-full border border-border-strong text-text-secondary hover:bg-surface-2 hover:text-text"
                aria-label="Visualizar avatar original"
              >
                <ExternalLink className="size-4" />
              </a>
              <a
                href={`/api/discord/avatar?id=${user.id}&hash=${encodeURIComponent(user.avatarHash)}&format=${user.avatarAnimated ? "gif" : "webp"}`}
                title="Baixar avatar"
                className="inline-flex size-10 items-center justify-center rounded-full border border-border-strong text-text-secondary hover:bg-surface-2 hover:text-text"
                aria-label="Baixar avatar"
              >
                <Download className="size-4" />
              </a>
            </div>
          )}
          <button
            type="button"
            onClick={onCopy}
            className="mb-1 inline-flex h-10 items-center gap-2 rounded-full border border-border-strong px-4 text-xs font-bold text-text-secondary transition-colors hover:bg-surface-2 hover:text-text"
          >
            {copied ? <Check className="size-4 text-success" /> : <Copy className="size-4" />}
            {copied ? "Copiado" : "Copiar ID"}
          </button>
        </div>

        <div className="mt-4">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-2xl font-extrabold tracking-tight text-text sm:text-[28px]">
              {user.displayName || user.username}
            </h2>
            {user.bot && (
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-tint px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-brand">
                <Bot className="size-3.5" /> Bot
              </span>
            )}
          </div>
          <p className="mt-0.5 text-sm font-medium text-text-secondary">
            @{user.username}{user.discriminator ? `#${user.discriminator}` : ""}
          </p>
          <p className="mt-2 break-all font-mono text-xs text-muted">{user.id}</p>
        </div>

        <div className="mt-6 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-3">
          <InfoItem icon={CalendarDays} label="Conta criada" value={formatDate(user.accountCreatedAt)} />
          <InfoItem icon={Clock3} label="Tempo de conta" value={accountAge(user.accountCreatedAt)} />
          <InfoItem icon={ScanSearch} label="Visto pelo DisMe" value={formatDate(user.firstSeenAt)} />
        </div>

        {(user.badges.length > 0 ||
          user.primaryGuild?.tag ||
          user.nitro.active === true ||
          user.nitroLikely ||
          user.avatarDecorationUrl ||
          user.nameplate ||
          user.flairs.length > 0) && (
          <div className="mt-6">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted">Identidade pública</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {user.badges.map((badge) => (
                <span key={badge.key} title={badge.since ? `${badge.description} Desde ${formatDate(badge.since)}` : badge.description} className={chipClass}>
                  {(() => { const Icon = badgeIcons[badge.icon as keyof typeof badgeIcons] ?? ShieldCheck; return <Icon className="size-4 text-brand" />; })()} {badge.label}
                </span>
              ))}
              {user.primaryGuild?.tag && (
                <span className="inline-flex items-center gap-2 rounded-full bg-surface-3 px-3 py-1.5 text-xs font-bold text-text-secondary">
                  {user.primaryGuild.badgeUrl && <Image src={user.primaryGuild.badgeUrl} alt="" width={18} height={18} />}
                  {user.primaryGuild.tag}
                </span>
              )}
              {user.nitro.active === true ? (
                <span title={user.nitro.since ? `Assinatura desde ${formatDate(user.nitro.since)}` : "Nitro retornado pelo Discord"} className={chipClass}>
                  <Sparkles className="size-4 text-brand" /> {user.nitro.type ?? "Nitro"}
                </span>
              ) : (
                user.nitroConfirmed && (
                  <span title="Recursos exclusivos de Nitro detectados (enfeite, nameplate ou avatar/banner animado)." className={chipClass}>
                    <Sparkles className="size-4 text-brand" /> Nitro
                  </span>
                )
              )}
              {user.avatarDecorationUrl && (
                <span className={chipClass}>
                  <Image src={user.avatarDecorationUrl} alt="" width={18} height={18} className="object-contain" /> Enfeite de avatar
                </span>
              )}
              {user.nameplate && (
                <span className={chipClass}>
                  <Sparkles className="size-4 text-brand" /> Nameplate{user.nameplate.label ? `: ${user.nameplate.label}` : ""}
                </span>
              )}
              {user.flairs.map((flair) => (
                <span key={flair} className={chipClass}>
                  <Star className="size-4 text-brand" /> {flair}
                </span>
              ))}
            </div>
          </div>
        )}

        <section className="mt-6 border-t border-border pt-6">
          <details className="group">
            <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-extrabold text-text">
              <span className="flex items-center gap-2"><Hash className="size-4 text-brand" /> Detalhes técnicos</span>
              <ChevronDown className="size-4 text-muted transition-transform group-open:rotate-180" />
            </summary>
            <div className="mt-4 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2">
              <Detail label="Criação exata" value={formatDate(user.accountCreatedAt, true)} />
              <Detail label="Idade da conta" value={`${user.accountAgeDays.toLocaleString("pt-BR")} dias`} />
              <Detail label="Public flags" value={String(user.publicFlagsRaw)} />
              <Detail label="Snowflake" value={`worker ${user.snowflake.workerId} · proc ${user.snowflake.processId} · #${user.snowflake.increment}`} />
              <Detail
                label="Avatar"
                value={user.isDefaultAvatar ? "Padrão do Discord" : `${user.avatarAnimated ? "Animado" : "Estático"}${user.avatarHash ? ` · ${user.avatarHash.slice(0, 14)}…` : ""}`}
              />
              <Detail
                label="Banner"
                value={user.bannerHash ? `${user.bannerAnimated ? "Animado" : "Estático"} · ${user.bannerHash.slice(0, 14)}…` : "Sem banner"}
              />
              {user.accentColor != null && (
                <Detail label="Cor de destaque" value={`#${user.accentColor.toString(16).padStart(6, "0")}`} swatch={`#${user.accentColor.toString(16).padStart(6, "0")}`} />
              )}
              {user.avatarDecorationExpiresAt && (
                <Detail label="Enfeite expira em" value={formatDate(user.avatarDecorationExpiresAt)} />
              )}
            </div>
          </details>
        </section>

        <section className="mt-8 border-t border-border pt-6" aria-labelledby="identity-history-title">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 id="identity-history-title" className="flex items-center gap-2 text-base font-extrabold text-text">
                <History className="size-5 text-brand" /> Histórico observado
              </h3>
              <p className="mt-1 text-xs text-muted">Alterações encontradas pelo DisMe a partir da primeira consulta.</p>
            </div>
            <span className="shrink-0 text-xs font-semibold text-muted">{result.cached ? "Em cache" : "Atualizado agora"}</span>
          </div>

          <div className="mt-5 divide-y divide-border">
            {history.map((version, index) => (
              <div key={version.id} className="flex items-center gap-3 py-4 first:pt-0 last:pb-0">
                {version.avatarUrl ? (
                  <Image src={version.avatarUrl} alt="" width={44} height={44} className="size-11 rounded-full bg-surface-3 object-cover" />
                ) : (
                  <div className="size-11 rounded-full bg-surface-3" aria-hidden="true" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-text">{version.displayName || version.username}</p>
                  {version.username && <p className="truncate text-xs text-text-secondary">@{version.username}</p>}
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xs font-semibold text-text-secondary">
                    {index === 0 ? "Atual" : version.firstSeen ? "Primeiro registro" : "Alteração"}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted">{formatDate(version.observedAt, true)}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }: { icon: typeof CalendarDays; label: string; value: string }) {
  return (
    <div className="bg-surface-2 px-4 py-4">
      <div className="flex items-center gap-2 text-muted">
        <Icon className="size-4" />
        <span className="text-[11px] font-bold uppercase tracking-wide">{label}</span>
      </div>
      <p className="mt-2 text-sm font-bold text-text">{value}</p>
    </div>
  );
}

function Detail({ label, value, swatch }: { label: string; value: string; swatch?: string }) {
  return (
    <div className="bg-surface-2 px-4 py-3">
      <p className="text-[11px] font-bold uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 flex items-center gap-2 break-all font-mono text-xs text-text">
        {swatch && <span className="size-3 shrink-0 rounded-full ring-1 ring-border-strong" style={{ backgroundColor: swatch }} />}
        {value}
      </p>
    </div>
  );
}

function LookupSkeleton() {
  return (
    <div className="overflow-hidden border-y border-border bg-surface sm:rounded-2xl sm:border" aria-label="Carregando resultado">
      <div className="h-28 animate-pulse bg-surface-3 sm:h-40" />
      <div className="px-4 pb-7 sm:px-7">
        <div className="-mt-10 size-24 animate-pulse rounded-full border-4 border-surface bg-surface-3" />
        <div className="mt-4 h-7 w-48 animate-pulse rounded bg-surface-3" />
        <div className="mt-3 h-4 w-28 animate-pulse rounded bg-surface-3" />
        <div className="mt-7 h-24 animate-pulse rounded-xl bg-surface-2" />
      </div>
    </div>
  );
}
