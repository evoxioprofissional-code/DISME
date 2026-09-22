import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, ExternalLink, Hash, Languages, Radio, Settings, ShieldCheck, Smile, Sparkles, Users, Zap } from "lucide-react";
import { PageContainer } from "@/components/layout/AppShell";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { buttonClasses } from "@/components/ui/Button";
import { getDiscordServer } from "@/lib/server-directory";
import { getSessionUserId } from "@/lib/queries";
import { discordAccountCreatedAt } from "@/lib/discord";
import { formatNumber, longDate } from "@/lib/utils";

const verification = ["Sem verificação", "Baixa", "Média", "Alta", "Muito alta"];
function featureLabel(value: string) { return value.toLowerCase().split("_").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" "); }

export default async function DiscordServerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [server, meId] = await Promise.all([getDiscordServer(id), getSessionUserId()]);
  if (!server) notFound();
  const isOwner = meId === server.ownerProfileId;
  const stats = [
    { label: "Membros", value: formatNumber(server.memberCount), Icon: Users },
    { label: "Online", value: formatNumber(server.onlineCount), Icon: Radio },
    { label: "Boosts", value: formatNumber(server.boostCount), Icon: Zap },
    { label: "Nível", value: String(server.boostTier), Icon: Sparkles },
  ];
  return (
    <PageContainer className="max-w-6xl px-0 sm:px-6">
      <div className="overflow-hidden border-y border-border bg-surface sm:rounded-3xl sm:border">
        <div className="relative h-44 bg-surface-2 sm:h-64">{server.bannerUrl || server.splashUrl ? <Image src={server.bannerUrl || server.splashUrl!} alt="" fill priority sizes="1100px" className="object-cover" /> : <div className="flex size-full items-center justify-center text-muted"><Radio className="size-12" strokeWidth={1.3} /></div>}</div>
        <div className="px-4 pb-6 sm:px-6"><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div className="-mt-12 min-w-0"><Avatar src={server.iconUrl} name={server.name} size="2xl" rounded="xl" className="rounded-2xl ring-4 ring-surface" /><h1 className="mt-3 text-2xl font-extrabold tracking-tight text-text sm:text-3xl">{server.name}</h1><Link href={`/profile/${server.owner.username}`} className="mt-1 inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text"><Avatar src={server.owner.avatar} name={server.owner.displayName} size="xs" /> anunciado por @{server.owner.username}</Link></div><div>{isOwner ? <Link href={`/server/${server.id}/edit`} className={buttonClasses()}><Settings className="size-4" /> Gerenciar anúncio</Link> : server.inviteUrl ? <a href={server.inviteUrl} target="_blank" rel="noreferrer" className={buttonClasses({ size: "lg" })}>Entrar no servidor <ExternalLink className="size-4" /></a> : null}</div></div>{(server.promoText || server.discordDescription) && <p className="mt-5 max-w-3xl whitespace-pre-line text-[15px] leading-7 text-text-secondary">{server.promoText || server.discordDescription}</p>}<div className="mt-5 flex flex-wrap gap-2">{server.tags.map((tag) => <Chip key={tag}>{tag}</Chip>)}</div></div>
      </div>
      <div className="grid gap-6 px-4 pt-6 sm:px-0 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6"><Card className="grid grid-cols-2 divide-x divide-y divide-border overflow-hidden sm:grid-cols-4 sm:divide-y-0">{stats.map(({ label, value, Icon }) => <div key={label} className="p-4 sm:p-5"><Icon className="size-4 text-brand" /><p className="tnum mt-3 text-xl font-extrabold text-text">{value}</p><p className="mt-0.5 text-xs text-muted">{label}</p></div>)}</Card>{server.discordDescription && server.promoText && <section><h2 className="text-lg font-extrabold text-text">Sobre no Discord</h2><p className="mt-2 text-sm leading-6 text-text-secondary">{server.discordDescription}</p></section>}{server.features.length > 0 && <section><h2 className="text-lg font-extrabold text-text">Recursos do servidor</h2><div className="mt-3 flex flex-wrap gap-2">{server.features.slice(0, 20).map((feature) => <Chip key={feature} variant="outline">{featureLabel(feature)}</Chip>)}</div></section>}</div>
        <aside className="space-y-4"><Card className="p-5"><h2 className="text-sm font-extrabold text-text">Detalhes oficiais</h2><div className="mt-4 space-y-3 text-sm"><p className="flex items-center justify-between gap-3"><span className="flex items-center gap-2 text-text-secondary"><ShieldCheck className="size-4" /> Verificação</span><strong className="text-text">{verification[server.verificationLevel]}</strong></p><p className="flex items-center justify-between gap-3"><span className="flex items-center gap-2 text-text-secondary"><Hash className="size-4" /> Canais</span><strong className="text-text">{server.channelCount}</strong></p><p className="flex items-center justify-between gap-3"><span className="flex items-center gap-2 text-text-secondary"><Users className="size-4" /> Cargos</span><strong className="text-text">{server.roleCount}</strong></p><p className="flex items-center justify-between gap-3"><span className="flex items-center gap-2 text-text-secondary"><Smile className="size-4" /> Emojis</span><strong className="text-text">{server.emojiCount}</strong></p>{server.preferredLocale && <p className="flex items-center justify-between gap-3"><span className="flex items-center gap-2 text-text-secondary"><Languages className="size-4" /> Idioma</span><strong className="text-text">{server.preferredLocale}</strong></p>}<p className="flex items-center justify-between gap-3"><span className="flex items-center gap-2 text-text-secondary"><CalendarDays className="size-4" /> Criado</span><strong className="text-text">{longDate(discordAccountCreatedAt(server.guildId))}</strong></p></div><p className="mt-4 border-t border-border pt-4 text-[11px] leading-5 text-muted">Dados sincronizados com a API oficial do Discord em {new Date(server.syncedAt).toLocaleString("pt-BR")}.</p></Card>{server.inviteUrl && <a href={server.inviteUrl} target="_blank" rel="noreferrer" className={buttonClasses({ size: "lg", className: "w-full" })}>Entrar no servidor <ExternalLink className="size-4" /></a>}</aside>
      </div>
    </PageContainer>
  );
}
