import Image from "next/image";
import Link from "next/link";
import { Radio, Users, Zap } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Chip } from "@/components/ui/Chip";
import { formatCompact } from "@/lib/utils";
import type { DiscordServerListing } from "@/types/discord-server";

export function ServerCard({ server, priority = false }: { server: DiscordServerListing; priority?: boolean }) {
  return (
    <Link href={`/server/${server.id}`} className="group overflow-hidden rounded-2xl border border-border bg-surface transition-colors hover:border-border-strong">
      <div className="relative h-28 bg-surface-2">{server.bannerUrl || server.splashUrl ? <Image src={server.bannerUrl || server.splashUrl!} alt="" fill priority={priority} sizes="(max-width: 640px) 100vw, 33vw" className="object-cover transition-transform duration-300 group-hover:scale-[1.02]" /> : <div className="flex size-full items-center justify-center text-muted"><Radio className="size-9" strokeWidth={1.4} /></div>}</div>
      <div className="relative px-4 pb-4">
        <Avatar src={server.iconUrl} name={server.name} size="lg" rounded="xl" className="-mt-7 rounded-xl ring-4 ring-surface" />
        <h2 className="mt-3 truncate text-base font-extrabold text-text">{server.name}</h2>
        <p className="mt-1 line-clamp-2 min-h-10 text-sm leading-5 text-text-secondary">{server.promoText || server.discordDescription || "Servidor anunciado no DisMe."}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">{server.tags.slice(0, 3).map((tag) => <Chip key={tag}>{tag}</Chip>)}</div>
        <div className="mt-4 flex items-center gap-4 border-t border-border pt-3 text-xs font-semibold text-muted">
          <span className="flex items-center gap-1.5"><Users className="size-3.5" /> {formatCompact(server.memberCount)}</span>
          <span className="flex items-center gap-1.5"><Radio className="size-3.5 text-success" /> {formatCompact(server.onlineCount)} online</span>
          {server.boostCount > 0 && <span className="flex items-center gap-1.5"><Zap className="size-3.5" /> {server.boostCount}</span>}
        </div>
      </div>
    </Link>
  );
}
