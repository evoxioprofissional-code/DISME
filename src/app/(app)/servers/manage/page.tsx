import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, Radio } from "lucide-react";
import { PageContainer } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { EmptyState } from "@/components/ui/EmptyState";
import { buttonClasses } from "@/components/ui/Button";
import { ManageServerActions } from "@/components/servers/ManageServerActions";
import { listMyDiscordServers } from "@/lib/server-directory";
import { getSessionUserId } from "@/lib/queries";
import { formatNumber } from "@/lib/utils";

export default async function ManageServersPage() {
  if (!await getSessionUserId()) redirect(`/login?next=${encodeURIComponent("/servers/manage")}`);
  const servers = await listMyDiscordServers();
  return <PageContainer className="max-w-5xl"><PageHeader title="Meus servidores" subtitle="Gerencie os anúncios conectados ao Discord" action={<Link href="/servers/new" className={buttonClasses({ size: "sm" })}><Plus className="size-4" /> Anunciar servidor</Link>} />{servers.length ? <div className="space-y-3">{servers.map((server) => <Card key={server.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center"><div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-surface-2">{server.iconUrl ? <Image src={server.iconUrl} alt="" fill sizes="80px" className="object-cover" /> : <div className="flex size-full items-center justify-center"><Radio className="size-6 text-muted" /></div>}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><Link href={`/server/${server.id}`} className="truncate text-sm font-extrabold text-text hover:underline">{server.name}</Link><Chip variant={server.isPublished ? "brand" : "outline"}>{server.isPublished ? "Publicado" : "Oculto"}</Chip></div><p className="mt-1 text-xs text-text-secondary">{formatNumber(server.memberCount)} membros · sincronizado {new Date(server.syncedAt).toLocaleDateString("pt-BR")}</p></div><ManageServerActions server={server} /></Card>)}</div> : <EmptyState title="Nenhum servidor anunciado" description="Adicione o bot DisMe ao seu servidor e importe as informações oficiais." action={<Link href="/servers/new" className={buttonClasses()}>Anunciar servidor</Link>} />}</PageContainer>;
}
