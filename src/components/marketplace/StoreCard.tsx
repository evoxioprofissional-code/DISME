import Image from "next/image";
import Link from "next/link";
import { Package, ShieldCheck, Store as StoreIcon } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import type { MarketplaceStore } from "@/types/marketplace";

export function StoreCard({ store, priority = false }: { store: MarketplaceStore; priority?: boolean }) {
  return (
    <Link href={`/store/${store.slug}`} className="group overflow-hidden rounded-2xl border border-border bg-surface transition-colors hover:border-border-strong">
      <div className="relative h-28 bg-surface-2">
        {store.banner ? <Image src={store.banner} alt="" fill priority={priority} sizes="(max-width: 640px) 100vw, 33vw" className="object-cover transition-transform duration-300 group-hover:scale-[1.02]" /> : <div className="flex size-full items-center justify-center text-muted"><StoreIcon className="size-9" strokeWidth={1.4} /></div>}
      </div>
      <div className="relative px-4 pb-4">
        <Avatar src={store.avatar || store.owner.avatar} name={store.name} size="lg" rounded="xl" className="-mt-7 rounded-xl ring-4 ring-surface" />
        <h2 className="mt-3 truncate text-base font-extrabold text-text">{store.name}</h2>
        <p className="mt-1 line-clamp-2 min-h-10 text-sm leading-5 text-text-secondary">{store.description || `Loja de @${store.owner.username}`}</p>
        <div className="mt-4 flex items-center gap-4 border-t border-border pt-3 text-xs font-semibold text-muted">
          <span className="flex items-center gap-1.5"><Package className="size-3.5" /> {store.productCount} {store.productCount === 1 ? "produto" : "produtos"}</span>
          {store.showcaseCount > 0 && <span className="flex items-center gap-1.5"><ShieldCheck className="size-3.5" /> {store.showcaseCount} exposições</span>}
        </div>
      </div>
    </Link>
  );
}
