import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Bookmark, CheckCircle2, ExternalLink, Flag, MessageCircle, ShieldCheck, Store } from "lucide-react";
import { PageContainer } from "@/components/layout/AppShell";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { buttonClasses } from "@/components/ui/Button";
import { getMarketplaceListing } from "@/lib/marketplace";
import { reportMarketplaceListing, toggleMarketplaceFavorite } from "@/lib/marketplace-actions";
import { marketplaceCategoryLabels } from "@/types/marketplace";
import { cn, longDate } from "@/lib/utils";

function formatPrice(cents?: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format((cents ?? 0) / 100);
}

export default async function MarketplaceListingPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ reported?: string }> }) {
  const { id } = await params;
  const query = await searchParams;
  const listing = await getMarketplaceListing(id);
  if (!listing) notFound();
  const showcase = listing.kind === "showcase";
  const discordUrl = listing.seller.discordId ? `https://discord.com/users/${listing.seller.discordId}` : null;

  return (
    <PageContainer className="max-w-6xl">
      <Link href={showcase ? "/marketplace?mode=showcase" : "/marketplace"} className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-text-secondary hover:text-text">← Voltar ao Marketplace</Link>
      {query.reported === "1" && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-success/30 bg-surface px-4 py-3 text-sm font-semibold text-success"><CheckCircle2 className="size-4" /> Denúncia enviada para análise.</div>
      )}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(300px,.75fr)]">
        <div className="min-w-0">
          <div className="grid gap-2 sm:grid-cols-2">
            <div className={cn("relative overflow-hidden rounded-2xl border border-border bg-surface-2", listing.images.length > 1 ? "aspect-[4/3] sm:row-span-2" : "aspect-[16/10] sm:col-span-2")}>
              {listing.images[0] ? <Image src={listing.images[0]} alt={listing.title} fill priority sizes="(max-width: 1024px) 100vw, 65vw" className="object-cover" /> : <div className="flex size-full items-center justify-center text-muted"><Store className="size-12" strokeWidth={1.4} /></div>}
            </div>
            {listing.images.slice(1, 3).map((image, index) => (
              <div key={image} className="relative hidden aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-surface-2 sm:block">
                <Image src={image} alt={`${listing.title}, imagem ${index + 2}`} fill sizes="33vw" className="object-cover" />
              </div>
            ))}
          </div>

          <div className="mt-6">
            <div className="flex flex-wrap items-center gap-2">
              <Chip variant={showcase ? "brand" : "outline"} icon={showcase ? <ShieldCheck /> : <Store />}>{showcase ? "Somente exposição" : marketplaceCategoryLabels[listing.category]}</Chip>
              {listing.platform && <Chip>{listing.platform}</Chip>}
            </div>
            <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-text sm:text-3xl">{listing.title}</h1>
            <p className="mt-4 whitespace-pre-line text-[15px] leading-7 text-text-secondary">{listing.description}</p>
            {listing.tags.length > 0 && <div className="mt-5 flex flex-wrap gap-2">{listing.tags.map((tag) => <Chip key={tag} variant="outline">{tag}</Chip>)}</div>}
            {listing.transferMethod && (
              <div className="mt-6 border-t border-border pt-5">
                <h2 className="text-sm font-extrabold text-text">Forma de entrega</h2>
                <p className="mt-2 text-sm leading-6 text-text-secondary">{listing.transferMethod}</p>
              </div>
            )}
          </div>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <Card className="p-5">
            {showcase ? (
              <div className="flex gap-3">
                <ShieldCheck className="mt-0.5 size-6 shrink-0 text-brand" />
                <div><p className="font-extrabold text-text">Esta conta não está à venda</p><p className="mt-1 text-sm leading-5 text-text-secondary">A publicação existe apenas para exposição e registro da história.</p></div>
              </div>
            ) : (
              <>
                <span className="text-xs font-semibold uppercase tracking-wide text-muted">Valor informado</span>
                <p className="tnum mt-1 text-3xl font-extrabold tracking-tight text-text">{formatPrice(listing.priceCents)}</p>
                <p className="mt-2 text-xs leading-5 text-muted">Pagamento e acordo acontecem fora do DisMe. Verifique tudo antes de negociar.</p>
              </>
            )}
            <div className="mt-5 flex flex-col gap-2">
              {!showcase && discordUrl && <a href={discordUrl} target="_blank" rel="noreferrer" className={buttonClasses({ className: "w-full" })}><MessageCircle className="size-4" /> Conversar no Discord <ExternalLink className="size-3.5" /></a>}
              {!showcase && !discordUrl && <Link href={`/profile/${listing.seller.username}`} className={buttonClasses({ className: "w-full" })}><MessageCircle className="size-4" /> Ver perfil do anunciante</Link>}
              <form action={toggleMarketplaceFavorite}>
                <input type="hidden" name="listing_id" value={listing.id} />
                <button className={buttonClasses({ variant: "outline", className: "w-full" })}><Bookmark className={cn("size-4", listing.favorite && "fill-current text-brand")} />{listing.favorite ? "Salvo" : "Salvar"}</button>
              </form>
            </div>
          </Card>

          <Card className="p-5">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted">Publicado por</span>
            <Link href={`/profile/${listing.seller.username}`} className="mt-3 flex items-center gap-3 rounded-xl p-2 -mx-2 transition-colors hover:bg-surface-2">
              <Avatar src={listing.seller.avatar} name={listing.seller.displayName} size="md" />
              <span className="min-w-0 flex-1"><span className="block truncate text-sm font-extrabold text-text">{listing.seller.displayName}</span><span className="block truncate text-xs text-text-secondary">@{listing.seller.username}</span></span>
              <span className="text-sm text-muted">›</span>
            </Link>
            <p className="mt-3 text-xs text-muted">Publicado em {longDate(listing.createdAt)}</p>
          </Card>

          <details className="group rounded-2xl border border-border bg-surface">
            <summary className="flex cursor-pointer list-none items-center gap-2 px-5 py-4 text-sm font-semibold text-text-secondary hover:text-text"><Flag className="size-4" /> Denunciar publicação</summary>
            <form action={reportMarketplaceListing} className="space-y-3 border-t border-border p-5">
              <input type="hidden" name="listing_id" value={listing.id} />
              <select name="reason" className="h-10 w-full rounded-lg border border-border-strong bg-bg px-3 text-sm text-text">
                <option value="prohibited_sale">Venda proibida de conta</option>
                <option value="scam">Possível golpe</option>
                <option value="misleading">Informação enganosa</option>
                <option value="stolen_content">Conteúdo de outra pessoa</option>
                <option value="other">Outro motivo</option>
              </select>
              <textarea name="details" maxLength={500} rows={3} placeholder="Conte o que aconteceu" className="w-full resize-none rounded-lg border border-border-strong bg-bg px-3 py-2 text-sm text-text placeholder:text-muted" />
              <button className={buttonClasses({ variant: "outline", size: "sm", className: "w-full" })}>Enviar denúncia</button>
            </form>
          </details>
        </aside>
      </div>
    </PageContainer>
  );
}
