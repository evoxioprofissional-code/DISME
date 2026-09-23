"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";
import {
  ArrowLeft,
  AtSign,
  Award,
  Bot,
  CalendarDays,
  Check,
  Clock3,
  Copy,
  Download,
  ExternalLink,
  FileDown,
  Flame,
  Gem,
  Gavel,
  Globe,
  Handshake,
  Hash,
  Heart,
  History,
  ImageIcon,
  Bug,
  Code,
  Languages,
  Maximize2,
  Palette,
  RefreshCw,
  Rocket,
  ScanSearch,
  Scale,
  ShieldCheck,
  Sparkles,
  Star,
  Terminal,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { DiscordLookupResult, DiscordPublicUser } from "@/types/discord";

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

const TABS = ["visao", "historico", "avatares", "banners", "badges"] as const;
type Tab = (typeof TABS)[number];
const TAB_LABELS: Record<Tab, string> = {
  visao: "Visão geral",
  historico: "Histórico",
  avatares: "Avatares",
  banners: "Banners",
  badges: "Badges",
};

export function DiscordLookup() {
  const [id, setId] = useState("");
  const [queryId, setQueryId] = useState("");
  const [result, setResult] = useState<DiscordLookupResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function runLookup(targetId: string) {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/discord/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: targetId }),
      });
      const data = (await response.json()) as DiscordLookupResult & { error?: string };
      if (!response.ok) throw new Error(data.error || "Não foi possível concluir a consulta.");
      setResult(data);
      setQueryId(targetId);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível concluir a consulta.");
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void runLookup(id);
  }

  if (result) {
    return (
      <ProfileView
        result={result}
        loading={loading}
        onBack={() => {
          setResult(null);
          setError("");
        }}
        onRefresh={() => runLookup(queryId)}
      />
    );
  }

  return (
    <div className="space-y-5 px-4 sm:px-0">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-text lg:text-[28px]">Consulta Discord</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Encontre a identidade pública atual de qualquer conta pelo ID.
        </p>
      </div>

      <form onSubmit={submit} className="rounded-2xl border border-border bg-surface p-5">
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
            />
          </div>
          <Button type="submit" size="lg" disabled={loading || id.length < 17} className="sm:min-w-36">
            {loading ? "Consultando..." : "Consultar"}
          </Button>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-muted">
          No Discord, ative o Modo Desenvolvedor, clique com o botão direito no usuário e escolha “Copiar ID do usuário”.
        </p>
      </form>

      {error && (
        <div role="alert" className="rounded-xl border border-danger/40 bg-danger-tint px-4 py-3 text-sm text-text">
          {error}
        </div>
      )}
      {loading && <LookupSkeleton />}
    </div>
  );
}

function ProfileView({
  result,
  loading,
  onBack,
  onRefresh,
}: {
  result: DiscordLookupResult;
  loading: boolean;
  onBack: () => void;
  onRefresh: () => void;
}) {
  const { user, history } = result;
  const [tab, setTab] = useState<Tab>("visao");
  const [copied, setCopied] = useState(false);
  const accent = user.accentColor != null ? `#${user.accentColor.toString(16).padStart(6, "0")}` : null;
  const visibleTabs = user.badges.length > 0 ? TABS : TABS.filter((item) => item !== "badges");
  const activeTab = tab === "badges" && user.badges.length === 0 ? "visao" : tab;

  async function copyId() {
    await navigator.clipboard.writeText(user.id);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  function exportReport() {
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `disme-discord-${user.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4 px-4 sm:px-0">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="inline-flex h-10 items-center gap-2 rounded-full border border-border-strong px-4 text-sm font-semibold text-text-secondary transition-colors hover:bg-surface-2 hover:text-text"
        >
          <ArrowLeft className="size-4" /> Voltar
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={exportReport}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-border-strong px-4 text-sm font-semibold text-text-secondary transition-colors hover:bg-surface-2 hover:text-text"
          >
            <FileDown className="size-4" /> <span className="hidden sm:inline">Exportar relatório</span>
          </button>
          <button
            onClick={copyId}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-brand px-4 text-sm font-bold text-on-brand transition-colors hover:bg-brand-hover"
          >
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            {copied ? "Copiado" : "Copiar ID"}
          </button>
          <a
            href={`https://discord.com/users/${user.id}`}
            target="_blank"
            rel="noreferrer"
            aria-label="Abrir no Discord"
            className="inline-flex size-10 items-center justify-center rounded-full border border-border-strong text-text-secondary transition-colors hover:bg-surface-2 hover:text-text"
          >
            <ExternalLink className="size-4" />
          </a>
        </div>
      </div>

      {/* Header card */}
      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        <div
          className="relative h-28 sm:h-40"
          style={accent && !user.bannerUrl ? { backgroundColor: accent } : { backgroundColor: "var(--color-surface-3)" }}
        >
          {user.bannerUrl && <Image src={user.bannerUrl} alt="" fill sizes="1024px" className="object-cover" priority />}
        </div>
        <div className="px-4 pb-5 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex items-end gap-4">
              <div className="relative -mt-12 size-24 shrink-0 rounded-full border-4 border-surface bg-surface-3 sm:size-28">
                <Image src={user.avatarUrl} alt={user.displayName || user.username} fill sizes="112px" className="rounded-full object-cover" />
                {user.avatarDecorationUrl && (
                  <Image src={user.avatarDecorationUrl} alt="" fill sizes="112px" className="pointer-events-none scale-[1.18] object-contain" />
                )}
              </div>
              <div className="pb-1">
                <h2 className="text-2xl font-extrabold tracking-tight text-text sm:text-[28px]">
                  {user.displayName || user.username}
                </h2>
                <p className="text-sm font-medium text-text-secondary">
                  @{user.username}{user.discriminator ? `#${user.discriminator}` : ""}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className={chip}><UserRound className="size-3.5" /> {user.bot ? "Bot" : "Usuário"}</span>
                  <span className={chip}><Sparkles className="size-3.5 text-brand" /> Discord</span>
                  {user.primaryGuild?.tag && (
                    <span className={chip}>
                      {user.primaryGuild.badgeUrl && <Image src={user.primaryGuild.badgeUrl} alt="" width={16} height={16} />}
                      {user.primaryGuild.tag}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 pb-1">
              <a
                href={user.avatarUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="Ver avatar"
                className="inline-flex size-10 items-center justify-center rounded-full border border-border-strong text-text-secondary hover:bg-surface-2 hover:text-text"
              >
                <Maximize2 className="size-4" />
              </a>
              {user.avatarHash && (
                <a
                  href={`/api/discord/avatar?id=${user.id}&hash=${encodeURIComponent(user.avatarHash)}&format=${user.avatarAnimated ? "gif" : "webp"}`}
                  aria-label="Baixar avatar"
                  className="inline-flex size-10 items-center justify-center rounded-full border border-border-strong text-text-secondary hover:bg-surface-2 hover:text-text"
                >
                  <Download className="size-4" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between gap-3">
        <div className="no-scrollbar flex gap-1 overflow-x-auto">
          {visibleTabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                activeTab === t ? "bg-surface-3 text-text ring-1 ring-inset ring-border-strong" : "text-text-secondary hover:bg-surface-2 hover:text-text",
              )}
            >
              {TAB_LABELS[t]}
            </button>
          ))}
        </div>
        <div className="hidden items-center gap-3 sm:flex">
          <span className="whitespace-nowrap text-xs text-muted">
            Última consulta: {formatDate(user.lastSeenAt, true)}
          </span>
          <button
            onClick={onRefresh}
            disabled={loading}
            aria-label="Atualizar"
            className="inline-flex size-9 items-center justify-center rounded-full border border-border-strong text-text-secondary transition-colors hover:bg-surface-2 hover:text-text disabled:opacity-50"
          >
            <RefreshCw className={cn("size-4", loading && "animate-spin")} />
          </button>
        </div>
      </div>

      {activeTab === "visao" && <Overview user={user} onCopyId={copyId} />}
      {activeTab === "historico" && <HistoryTab result={result} />}
      {activeTab === "avatares" && <MediaTab kind="avatar" history={history} currentUrl={user.avatarUrl} />}
      {activeTab === "banners" && <MediaTab kind="banner" history={history} currentUrl={user.bannerUrl} />}
      {activeTab === "badges" && <BadgesTab user={user} />}
    </div>
  );
}

function Overview({ user, onCopyId }: { user: DiscordPublicUser; onCopyId: () => void }) {
  const accent = user.accentColor != null ? `#${user.accentColor.toString(16).padStart(6, "0")}` : null;
  const hypeSquad = user.badges.some((b) => b.id.startsWith("hypesquad"));
  const nitroValue =
    user.nitro.active === true ? user.nitro.type ?? "Nitro" : user.nitroConfirmed ? "Detectado" : "Não detectado";

  return (
    <div className="space-y-4">
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={<CalendarDays className="size-4" />} label="Conta criada" value={formatDate(user.accountCreatedAt)} sub={`Há ${user.accountAgeDays.toLocaleString("pt-BR")} dias`} />
        <StatCard icon={<Clock3 className="size-4" />} label="Idade da conta" value={accountAge(user.accountCreatedAt)} sub={`${user.accountAgeDays.toLocaleString("pt-BR")} dias`} />
        <StatCard icon={<ScanSearch className="size-4" />} label="Visto pelo DisMe" value={formatDate(user.firstSeenAt)} sub={formatDate(user.lastSeenAt, true).split(" ").at(-1)} />
        <StatCard
          icon={<Hash className="size-4" />}
          label="ID do usuário"
          value={<span className="font-mono text-sm">{user.id}</span>}
          action={
            <button onClick={onCopyId} aria-label="Copiar ID" className="text-muted hover:text-text">
              <Copy className="size-3.5" />
            </button>
          }
        />
      </div>

      <div className={cn("grid gap-3", user.badges.length > 0 ? "lg:grid-cols-3" : "lg:grid-cols-2")}>
        <Panel title="Perfil" icon={<UserRound className="size-4 text-brand" />}>
          <Row icon={<UserRound className="size-4" />} label="Nome de usuário" value={`@${user.username}`} />
          <Row icon={<AtSign className="size-4" />} label="Nome de exibição" value={user.displayName || "—"} />
          <Row icon={<ImageIcon className="size-4" />} label="Avatar" value={user.isDefaultAvatar ? "Padrão" : `${user.avatarAnimated ? "Animado" : "Estático"}`} sub={user.avatarHash?.slice(0, 14)} />
          <Row icon={<ImageIcon className="size-4" />} label="Banner" value={user.bannerHash ? (user.bannerAnimated ? "Animado" : "Estático") : "Sem banner"} />
          <Row icon={<Palette className="size-4" />} label="Cores do perfil" value={accent ?? "Não definida"} swatch={accent ?? undefined} />
          <Row icon={<Terminal className="size-4" />} label="Bio" value="Não informada" muted />
        </Panel>

        {user.badges.length > 0 && (
          <Panel title="Badges" icon={<Award className="size-4 text-brand" />}>
            <div className="flex flex-wrap gap-2">
              {user.badges.map((badge) => {
                const Icon = badgeIcons[badge.icon as keyof typeof badgeIcons] ?? ShieldCheck;
                return (
                  <span key={badge.key} title={badge.description} className={chip}>
                    <Icon className="size-4 text-brand" /> {badge.label}
                  </span>
                );
              })}
            </div>
          </Panel>
        )}

        <Panel title="Status e flags" icon={<Hash className="size-4 text-brand" />}>
          <Row icon={<Hash className="size-4" />} label="Public flags" value={String(user.publicFlagsRaw)} />
          <Row icon={<ShieldCheck className="size-4" />} label="É um bot?" value={user.bot ? "Sim" : "Não"} />
          <Row icon={<Terminal className="size-4" />} label="Conta de sistema" value={user.system ? "Sim" : "Não"} />
          <Row icon={<Sparkles className="size-4" />} label="HypeSquad" value={hypeSquad ? "Sim" : "Não"} />
          <Row icon={<Star className="size-4" />} label="Selos" value={user.flairs.length ? user.flairs.join(" · ") : "—"} />
        </Panel>
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <Panel title="Avatar atual" icon={<ImageIcon className="size-4 text-brand" />}>
          <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-surface-2">
            <Image src={user.avatarUrl} alt="" fill sizes="320px" className="object-cover" />
          </div>
          <div className="mt-3 flex gap-2">
            <a href={user.avatarUrl} target="_blank" rel="noreferrer" className="flex h-10 flex-1 items-center justify-center gap-2 rounded-full border border-border-strong text-xs font-semibold text-text-secondary hover:bg-surface-2 hover:text-text">
              <Maximize2 className="size-4" /> Tamanho real
            </a>
            {user.avatarHash && (
              <a href={`/api/discord/avatar?id=${user.id}&hash=${encodeURIComponent(user.avatarHash)}&format=${user.avatarAnimated ? "gif" : "webp"}`} className="flex h-10 flex-1 items-center justify-center gap-2 rounded-full bg-brand text-xs font-bold text-on-brand hover:bg-brand-hover">
                <Download className="size-4" /> Baixar
              </a>
            )}
          </div>
        </Panel>

        <Panel title="Banner atual" icon={<ImageIcon className="size-4 text-brand" />}>
          {user.bannerUrl ? (
            <div className="relative aspect-[3/1] w-full overflow-hidden rounded-xl bg-surface-2">
              <Image src={user.bannerUrl} alt="" fill sizes="320px" className="object-cover" />
            </div>
          ) : (
            <div className="flex aspect-[3/1] w-full flex-col items-center justify-center gap-1 rounded-xl bg-surface-2 text-center">
              <ImageIcon className="size-6 text-muted" />
              <p className="text-sm font-bold text-text">Sem banner</p>
            </div>
          )}
        </Panel>

        <Panel title="Informações adicionais" icon={<Globe className="size-4 text-brand" />}>
          <Row icon={<Hash className="size-4" />} label="Snowflake" value={`w${user.snowflake.workerId} · p${user.snowflake.processId} · #${user.snowflake.increment}`} mono />
          <Row icon={<Globe className="size-4" />} label="Região" value="Não disponível" muted />
          <Row icon={<Languages className="size-4" />} label="Idioma" value="Não disponível" muted />
          <Row icon={<Sparkles className="size-4" />} label="Premium (Nitro)" value={nitroValue} valueClass={user.nitroConfirmed || user.nitro.active === true ? "text-brand" : undefined} />
          <Row icon={<Rocket className="size-4" />} label="Server Booster" value={user.booster.active ? "Ativo" : "Não detectado"} muted={!user.booster.active} />
          <p className="mt-3 text-[11px] leading-relaxed text-muted">
            Alguns dados dependem da privacidade do usuário e podem não estar disponíveis.
          </p>
        </Panel>
      </div>
    </div>
  );
}

function HistoryTab({ result }: { result: DiscordLookupResult }) {
  const { history } = result;
  if (history.length === 0) {
    return <EmptyPanel icon={<History className="size-7" />} title="Sem histórico ainda" description="As mudanças de nome, avatar e banner passam a ser registradas a partir da primeira consulta." />;
  }
  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-extrabold text-text">
          <History className="size-4 text-brand" /> Histórico observado
        </h3>
        <span className="text-xs font-semibold text-muted">{result.cached ? "Em cache" : "Atualizado agora"}</span>
      </div>
      <div className="divide-y divide-border">
        {history.map((v, index) => (
          <div key={v.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
            {v.avatarUrl ? (
              <Image src={v.avatarUrl} alt="" width={44} height={44} className="size-11 rounded-full bg-surface-3 object-cover" />
            ) : (
              <div className="size-11 rounded-full bg-surface-3" aria-hidden="true" />
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-text">{v.displayName || v.username || "—"}</p>
              {v.username && <p className="truncate text-xs text-text-secondary">@{v.username}</p>}
            </div>
            <div className="shrink-0 text-right">
              <p className="text-xs font-semibold text-text-secondary">
                {index === 0 ? "Atual" : v.firstSeen ? "Primeiro registro" : "Alteração"}
              </p>
              <p className="mt-0.5 text-[11px] text-muted">{formatDate(v.observedAt, true)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MediaTab({
  kind,
  history,
  currentUrl,
}: {
  kind: "avatar" | "banner";
  history: DiscordLookupResult["history"];
  currentUrl: string | null;
}) {
  const seen = new Set<string>();
  const items: { url: string; observedAt: string; current: boolean }[] = [];
  if (currentUrl) {
    seen.add(currentUrl);
    items.push({ url: currentUrl, observedAt: history[0]?.observedAt ?? new Date().toISOString(), current: true });
  }
  for (const v of history) {
    const url = kind === "avatar" ? v.avatarUrl : v.bannerUrl;
    if (url && !seen.has(url)) {
      seen.add(url);
      items.push({ url, observedAt: v.observedAt, current: false });
    }
  }

  if (items.length === 0) {
    return (
      <EmptyPanel
        icon={<ImageIcon className="size-7" />}
        title={kind === "avatar" ? "Sem avatares registrados" : "Sem banners registrados"}
        description="As imagens são arquivadas a cada consulta — novas versões aparecem aqui conforme a pessoa muda."
      />
    );
  }

  return (
    <div className={cn("grid gap-3", kind === "avatar" ? "grid-cols-2 sm:grid-cols-4 lg:grid-cols-5" : "grid-cols-1 sm:grid-cols-2")}>
      {items.map((it, i) => (
        <a
          key={i}
          href={it.url}
          target="_blank"
          rel="noreferrer"
          className="group overflow-hidden rounded-2xl border border-border bg-surface"
        >
          <div className={cn("relative w-full overflow-hidden bg-surface-2", kind === "avatar" ? "aspect-square" : "aspect-[3/1]")}>
            <Image src={it.url} alt="" fill sizes="320px" className="object-cover transition-transform group-hover:scale-105" />
          </div>
          <div className="flex items-center justify-between gap-2 px-3 py-2">
            <span className={cn("text-[11px] font-bold", it.current ? "text-brand" : "text-text-secondary")}>
              {it.current ? "Atual" : "Anterior"}
            </span>
            <span className="text-[11px] text-muted">{formatDate(it.observedAt)}</span>
          </div>
        </a>
      ))}
    </div>
  );
}

function BadgesTab({ user }: { user: DiscordPublicUser }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {user.badges.map((badge) => {
        const Icon = badgeIcons[badge.icon as keyof typeof badgeIcons] ?? ShieldCheck;
        return (
          <div key={badge.key} className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-brand">
              <Icon className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-bold text-text">{badge.label}</p>
              <p className="truncate text-xs text-muted">{badge.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---- primitives ----
const chip = "inline-flex items-center gap-1.5 rounded-full bg-surface-3 px-2.5 py-1 text-xs font-semibold text-text-secondary";

function Panel({ title, icon, action, children }: { title: string; icon: React.ReactNode; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-sm font-extrabold text-text">{icon}{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}

function StatCard({ icon, label, value, sub, action }: { icon: React.ReactNode; label: string; value: React.ReactNode; sub?: string; action?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <div className="flex items-center justify-between text-muted">
        <span className="flex items-center gap-2">
          {icon}
          <span className="text-[11px] font-bold uppercase tracking-wide">{label}</span>
        </span>
        {action}
      </div>
      <p className="mt-2 truncate text-lg font-extrabold text-text">{value}</p>
      {sub && <p className="truncate text-xs text-muted">{sub}</p>}
    </div>
  );
}

function Row({
  icon,
  label,
  value,
  sub,
  mono,
  muted,
  valueClass,
  swatch,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  sub?: string;
  mono?: boolean;
  muted?: boolean;
  valueClass?: string;
  swatch?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-t border-border py-2.5 first:border-0 first:pt-0">
      <span className="flex shrink-0 items-center gap-2 text-sm text-text-secondary">
        <span className="text-muted">{icon}</span>
        {label}
      </span>
      <span className="flex min-w-0 items-center gap-2 text-right">
        {swatch && <span className="size-3 shrink-0 rounded-full ring-1 ring-border-strong" style={{ backgroundColor: swatch }} />}
        <span className="flex flex-col items-end">
          <span className={cn("truncate text-sm font-semibold", muted ? "text-muted" : "text-text", mono && "font-mono text-xs", valueClass)}>
            {value}
          </span>
          {sub && <span className="truncate font-mono text-[10px] text-muted">{sub}</span>}
        </span>
      </span>
    </div>
  );
}

function EmptyPanel({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border-strong bg-surface/50 px-6 py-14 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-surface-2 text-muted">{icon}</span>
      <p className="text-base font-bold text-text">{title}</p>
      <p className="max-w-md text-sm text-text-secondary">{description}</p>
    </div>
  );
}

function LookupSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface" aria-label="Carregando resultado">
      <div className="h-28 animate-pulse bg-surface-3 sm:h-40" />
      <div className="px-6 pb-7">
        <div className="-mt-12 size-24 animate-pulse rounded-full border-4 border-surface bg-surface-3" />
        <div className="mt-4 h-7 w-48 animate-pulse rounded bg-surface-3" />
        <div className="mt-3 h-4 w-28 animate-pulse rounded bg-surface-3" />
        <div className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-surface-2" />
          ))}
        </div>
      </div>
    </div>
  );
}
