"use client";

import Link from "next/link";
import { Pause, Pencil, Play, Trash2 } from "lucide-react";
import { deleteMarketplaceListing, setMarketplaceListingStatus } from "@/lib/marketplace-actions";
import type { MarketplaceListing } from "@/types/marketplace";
import { buttonClasses } from "@/components/ui/Button";

export function ManageListingActions({ listing }: { listing: MarketplaceListing }) {
  const nextStatus = listing.status === "active" ? "paused" : "active";
  return (
    <div className="flex flex-wrap gap-2">
      <Link href={`/marketplace/${listing.id}/edit`} className={buttonClasses({ variant: "outline", size: "sm" })}><Pencil className="size-3.5" /> Editar</Link>
      <form action={setMarketplaceListingStatus}><input type="hidden" name="listing_id" value={listing.id} /><input type="hidden" name="status" value={nextStatus} /><button className={buttonClasses({ variant: "ghost", size: "sm" })}>{nextStatus === "active" ? <Play className="size-3.5" /> : <Pause className="size-3.5" />}{nextStatus === "active" ? "Ativar" : "Pausar"}</button></form>
      <form action={deleteMarketplaceListing} onSubmit={(event) => { if (!window.confirm("Excluir esta publicação permanentemente?")) event.preventDefault(); }}><input type="hidden" name="listing_id" value={listing.id} /><button className={buttonClasses({ variant: "ghost", size: "sm", className: "text-danger hover:text-danger" })}><Trash2 className="size-3.5" /> Excluir</button></form>
    </div>
  );
}
