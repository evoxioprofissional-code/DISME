import Image from "next/image";
import Link from "next/link";
import { MonitorSmartphone, ShieldCheck } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Chip } from "@/components/ui/Chip";
import { marketplaceCategoryLabels, type MarketplaceListing } from "@/types/marketplace";
import { timeAgo } from "@/lib/utils";

function formatPrice(cents?: number) {
  if (cents === undefined) return null;
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}

export function ListingCard({ listing }: { listing: MarketplaceListing }) {
  const showcase = listing.kind === "showcase";
  return (
    <Link
      href={`/marketplace/${listing.id}`}
      className="group overflow-hidden rounded-2xl border border-border bg-surface transition-colors hover:border-border-strong"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-surface-2">
        {listing.images[0] ? (
          <Image
            src={listing.images[0]}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-muted">
            <MonitorSmartphone className="size-10" strokeWidth={1.5} />
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-full border border-white/10 bg-[#101014e8] px-2.5 py-1 text-[11px] font-bold text-text">
          {showcase ? "Somente exposição" : marketplaceCategoryLabels[listing.category]}
        </span>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="line-clamp-1 text-[15px] font-bold text-text">{listing.title}</h2>
            <p className="mt-1 line-clamp-2 text-sm leading-5 text-text-secondary">{listing.description}</p>
          </div>
          {showcase && <ShieldCheck className="mt-0.5 size-5 shrink-0 text-brand" aria-label="Exposição sem venda" />}
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {listing.platform && <Chip variant="outline">{listing.platform}</Chip>}
          {listing.tags.slice(0, 2).map((tag) => <Chip key={tag}>{tag}</Chip>)}
        </div>
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-3">
          <span className="flex min-w-0 items-center gap-2">
            <Avatar src={listing.seller.avatar} name={listing.seller.displayName} size="xs" />
            <span className="truncate text-xs font-semibold text-text-secondary">@{listing.seller.username}</span>
          </span>
          <span className="shrink-0 text-right">
            {showcase ? (
              <span className="text-xs font-semibold text-brand">Ver história</span>
            ) : (
              <span className="tnum block text-sm font-extrabold text-text">{formatPrice(listing.priceCents)}</span>
            )}
            <span className="block text-[10px] text-muted">{timeAgo(listing.createdAt)}</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
