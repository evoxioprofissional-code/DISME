import Link from "next/link";
import { ChevronRight, Gamepad2, Radio, Star, Store, Tag, Users } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/icons/Icon";
import { getGame } from "@/data";
import { connectionMeta } from "@/lib/labels";
import { formatNumber } from "@/lib/utils";
import type { User } from "@/types";
import type { MarketplaceStore } from "@/types/marketplace";
import type { DiscordServerListing } from "@/types/discord-server";

function AsideTitle({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.12em] text-text-secondary">
      <span className="text-brand">{icon}</span>
      {children}
    </p>
  );
}

function AsideButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="mt-3 flex h-9 w-full items-center justify-center gap-1.5 rounded-full border border-border-strong text-[11px] font-bold text-text transition-colors hover:border-brand/50 hover:bg-hover">
      {children}<ChevronRight className="size-3.5 text-brand" />
    </Link>
  );
}

export function ProfileSidebar({
  user,
  store,
  servers,
  followers,
  following,
  isSelf,
}: {
  user: User;
  store: MarketplaceStore | null;
  servers: DiscordServerListing[];
  followers: number;
  following: number;
  isSelf: boolean;
}) {
  const firstServer = servers[0];

  return (
    <aside className="space-y-3">
      <Card className="p-4">
        <AsideTitle icon={<Store className="size-4" />}>Loja</AsideTitle>
        <p className="mt-2 truncate text-sm font-extrabold text-text">{store?.name ?? (isSelf ? "Crie sua loja" : "Sem loja publicada")}</p>
        <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-muted">
          {store?.description || (isSelf ? "Produtos e exposições em um espaço só seu." : "Este perfil ainda não publicou uma loja.")}
        </p>
        {(store || isSelf) && <AsideButton href={store ? `/store/${store.slug}` : "/store/new"}>{store ? "Visitar loja" : "Criar minha loja"}</AsideButton>}
      </Card>

      <Card className="p-4">
        <AsideTitle icon={<Radio className="size-4" />}>Servidores</AsideTitle>
        <p className="mt-2 truncate text-sm font-extrabold text-text">{firstServer?.name ?? "Anuncie seu servidor"}</p>
        <p className="mt-1 text-[11px] leading-4 text-muted">
          {firstServer ? `${formatNumber(firstServer.memberCount)} membros · dados oficiais do Discord.` : "Dados verificados pela API oficial do Discord."}
        </p>
        <AsideButton href={firstServer ? `/server/${firstServer.id}` : isSelf ? "/servers/new" : "/servers"}>{firstServer ? "Ver servidor" : "Anunciar servidor"}</AsideButton>
      </Card>

      <Card className="p-4">
        <AsideTitle icon={<Star className="size-4" />}>Flex</AsideTitle>
        <p className="tnum mt-2 text-2xl font-black tracking-tight text-brand">{formatNumber(user.stats.flex)}</p>
        <p className="mt-0.5 text-[11px] text-muted">{user.flexRank ? `#${user.flexRank} no ranking global` : "Ainda fora do ranking global"}</p>
        <div className="mt-4 grid grid-cols-2 border-t border-border pt-3">
          <div>
            <p className="tnum text-base font-extrabold text-text">{formatNumber(followers)}</p>
            <p className="text-[10px] text-muted">Seguidores</p>
          </div>
          <div className="border-l border-border pl-4">
            <p className="tnum text-base font-extrabold text-text">{formatNumber(following)}</p>
            <p className="text-[10px] text-muted">Seguindo</p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <AsideTitle icon={<Gamepad2 className="size-4" />}>Jogos</AsideTitle>
        <div className="mt-3 space-y-2.5">
          {user.games.length ? user.games.slice(0, 3).map((id) => {
            const game = getGame(id);
            if (!game) return null;
            return (
              <div key={id} className="flex items-center gap-2.5">
                <span className="flex size-9 items-center justify-center rounded-lg border border-border bg-bg text-[9px] font-black text-text-secondary">{game.short}</span>
                <p className="min-w-0 flex-1 truncate text-xs font-semibold text-text">{game.name}</p>
              </div>
            );
          }) : <p className="text-[11px] text-muted">Nenhum jogo adicionado.</p>}
        </div>
        {user.games.length > 3 && <AsideButton href={`/profile/${user.username}`}>Ver todos os jogos</AsideButton>}
      </Card>

      <Card className="p-4">
        <AsideTitle icon={<Tag className="size-4" />}>Interesses</AsideTitle>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {user.interests.length ? user.interests.map((interest) => (
            <span key={interest} className="rounded-full border border-border bg-bg px-2.5 py-1 text-[10px] font-semibold text-text-secondary">{interest}</span>
          )) : <p className="text-[11px] text-muted">Nenhum interesse adicionado.</p>}
        </div>
      </Card>

      <Card className="p-4">
        <AsideTitle icon={<Users className="size-4" />}>Conexões</AsideTitle>
        <div className="mt-3 space-y-3">
          {user.connections.length ? user.connections.map((connection) => (
            <div key={connection.platform} className="flex min-w-0 items-center gap-2.5">
              <span className="text-brand"><Icon name={connectionMeta[connection.platform].icon} className="size-4" /></span>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold text-text">{connectionMeta[connection.platform].label}</p>
                <p className="truncate text-[10px] text-muted">{connection.detail ?? connection.handle}</p>
              </div>
            </div>
          )) : <p className="text-[11px] text-muted">Nenhuma conexão pública.</p>}
        </div>
      </Card>
    </aside>
  );
}
