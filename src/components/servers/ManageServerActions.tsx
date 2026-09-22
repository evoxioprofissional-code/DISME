"use client";

import Link from "next/link";
import { EyeOff, Eye, Pencil, RefreshCw, Trash2 } from "lucide-react";
import { deleteDiscordServer, refreshDiscordServer, setDiscordServerPublished } from "@/lib/server-directory-actions";
import { buttonClasses } from "@/components/ui/Button";
import type { DiscordServerListing } from "@/types/discord-server";

export function ManageServerActions({ server }: { server: DiscordServerListing }) {
  return <div className="flex flex-wrap gap-2"><Link href={`/server/${server.id}/edit`} className={buttonClasses({ variant: "outline", size: "sm" })}><Pencil className="size-3.5" /> Editar</Link><form action={refreshDiscordServer}><input type="hidden" name="listing_id" value={server.id} /><button className={buttonClasses({ variant: "ghost", size: "sm" })}><RefreshCw className="size-3.5" /> Sincronizar</button></form><form action={setDiscordServerPublished}><input type="hidden" name="listing_id" value={server.id} /><input type="hidden" name="published" value={String(!server.isPublished)} /><button className={buttonClasses({ variant: "ghost", size: "sm" })}>{server.isPublished ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}{server.isPublished ? "Ocultar" : "Publicar"}</button></form><form action={deleteDiscordServer} onSubmit={(event) => { if (!window.confirm("Excluir este anúncio de servidor?")) event.preventDefault(); }}><input type="hidden" name="listing_id" value={server.id} /><button className={buttonClasses({ variant: "ghost", size: "sm", className: "text-danger hover:text-danger" })}><Trash2 className="size-3.5" /> Excluir</button></form></div>;
}
