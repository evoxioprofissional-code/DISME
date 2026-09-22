import Link from "next/link";
import { Search, ShieldCheck, SlidersHorizontal } from "lucide-react";
import { PageContainer } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { ListingCard } from "@/components/marketplace/ListingCard";
import { StoreCard } from "@/components/marketplace/StoreCard";
import { buttonClasses } from "@/components/ui/Button";
import { listMarketplaceListings, listMarketplaceStores } from "@/lib/marketplace";
import type { MarketplaceCategory } from "@/types/marketplace";
import { cn } from "@/lib/utils";

const categories: { value: MarketplaceCategory | ""; label: string }[] = [
  { value: "", label: "Tudo" }, { value: "item", label: "Itens digitais" },
  { value: "service", label: "Serviços" }, { value: "peripheral", label: "Periféricos" },
  { value: "collectible", label: "Colecionáveis" },
];

export default async function MarketplacePage({ searchParams }: { searchParams: Promise<{ view?: string; category?: string; q?: string }> }) {
  const params = await searchParams;
  const view = params.view === "products" ? "products" : params.view === "showcases" ? "showcases" : "stores";
  const category = categories.some((item) => item.value === params.category) ? params.category as MarketplaceCategory : undefined;
  const stores = view === "stores" ? await listMarketplaceStores(params.q) : [];
  const listings = view !== "stores" ? await listMarketplaceListings({ kind: view === "showcases" ? "showcase" : "market", category, search: params.q }) : [];
  const actionHref = view === "stores" ? "/store/manage" : view === "showcases" ? "/marketplace/new?mode=showcase" : "/marketplace/new";
  const actionLabel = view === "stores" ? "Minha loja" : view === "showcases" ? "Criar exposição" : "Novo produto";
  return (
    <PageContainer className="max-w-6xl">
      <PageHeader title="Marketplace" subtitle="Lojas criadas pela comunidade DisMe" action={<Link href={actionHref} className={buttonClasses({ size: "sm" })}>{actionLabel}</Link>} />
      <div className="mb-5 flex border-b border-border" role="tablist" aria-label="Marketplace">
        {([ ["Lojas", "stores"], ["Produtos", "products"], ["Exposições", "showcases"] ] as const).map(([label, key]) => {
          const active = view === key;
          const href = key === "stores" ? "/marketplace" : `/marketplace?view=${key}`;
          return <Link key={key} href={href} role="tab" aria-selected={active} className={cn("relative px-4 py-3 text-sm font-bold transition-colors", active ? "text-text" : "text-muted hover:text-text-secondary")}>{label}{active && <span className="absolute inset-x-3 bottom-0 h-0.5 bg-brand" />}</Link>;
        })}
      </div>
      <form className="relative mb-5" action="/marketplace">
        {view !== "stores" && <input type="hidden" name="view" value={view} />}
        {category && <input type="hidden" name="category" value={category} />}
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
        <input name="q" defaultValue={params.q} maxLength={60} placeholder={view === "stores" ? "Buscar lojas" : view === "showcases" ? "Buscar exposições" : "Buscar produtos"} className="h-11 w-full rounded-xl border border-border-strong bg-surface pl-10 pr-4 text-sm text-text placeholder:text-muted focus:border-brand focus:outline-none" />
      </form>
      {view === "stores" ? (
        stores.length ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{stores.map((store, index) => <StoreCard key={store.id} store={store} priority={index === 0} />)}</div> : <EmptyState title="Nenhuma loja publicada ainda" description="Crie sua loja, personalize a vitrine e publique o primeiro produto." action={<Link href="/store/new" className={buttonClasses()}>Criar minha loja</Link>} />
      ) : view === "showcases" ? (
        <><div className="mb-6 flex items-start gap-3 rounded-xl border border-brand/20 bg-brand-tint px-4 py-3.5"><ShieldCheck className="mt-0.5 size-5 shrink-0 text-brand" /><p className="text-sm leading-5 text-text-secondary"><strong className="text-text">Vitrine da comunidade.</strong> Contas aparecem apenas por sua história ou características raras, sem preço, compra, troca ou transferência.</p></div>{listings.length ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{listings.map((listing) => <ListingCard key={listing.id} listing={listing} />)}</div> : <EmptyState title="Nenhuma exposição ainda" description="Exposições também ficam organizadas dentro da loja do usuário." action={<Link href="/marketplace/new?mode=showcase" className={buttonClasses()}>Criar exposição</Link>} />}</>
      ) : (
        <><div className="no-scrollbar mb-5 flex gap-2 overflow-x-auto pb-1">{categories.map((item) => { const active = (category ?? "") === item.value; const href = item.value ? `/marketplace?view=products&category=${item.value}` : "/marketplace?view=products"; return <Link key={item.value || "all"} href={href} className={cn("shrink-0 rounded-full border px-3.5 py-2 text-xs font-bold transition-colors", active ? "border-brand bg-brand-tint text-brand" : "border-border bg-surface text-text-secondary hover:border-border-strong hover:text-text")}>{item.label}</Link>; })}</div><div className="mb-6 flex items-start gap-3 rounded-xl border border-border bg-surface px-4 py-3.5"><SlidersHorizontal className="mt-0.5 size-5 shrink-0 text-text-secondary" /><p className="text-sm leading-5 text-text-secondary"><strong className="text-text">Negocie com cuidado.</strong> O DisMe não recebe pagamentos nem garante acordos externos. Nunca envie senha, token ou código de autenticação.</p></div>{listings.length ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{listings.map((listing) => <ListingCard key={listing.id} listing={listing} />)}</div> : <EmptyState title="Nenhum produto por aqui" description="Seja a primeira loja a publicar nesta categoria." action={<Link href="/marketplace/new" className={buttonClasses()}>Adicionar produto</Link>} />}</>
      )}
    </PageContainer>
  );
}
