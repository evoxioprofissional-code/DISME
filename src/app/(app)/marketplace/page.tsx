import Link from "next/link";
import { Search, ShieldCheck, SlidersHorizontal } from "lucide-react";
import { PageContainer } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { ListingCard } from "@/components/marketplace/ListingCard";
import { buttonClasses } from "@/components/ui/Button";
import { listMarketplaceListings } from "@/lib/marketplace";
import type { MarketplaceCategory, MarketplaceListingKind } from "@/types/marketplace";
import { cn } from "@/lib/utils";

const categories: { value: MarketplaceCategory | ""; label: string }[] = [
  { value: "", label: "Tudo" },
  { value: "item", label: "Itens digitais" },
  { value: "service", label: "Serviços" },
  { value: "peripheral", label: "Periféricos" },
  { value: "collectible", label: "Colecionáveis" },
];

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string; category?: string; q?: string }>;
}) {
  const params = await searchParams;
  const kind: MarketplaceListingKind = params.mode === "showcase" ? "showcase" : "market";
  const category = categories.some((item) => item.value === params.category)
    ? (params.category as MarketplaceCategory)
    : undefined;
  const listings = await listMarketplaceListings({ kind, category, search: params.q });
  const showcase = kind === "showcase";

  return (
    <PageContainer className="max-w-6xl">
      <PageHeader
        title="Marketplace"
        subtitle="Descubra itens da comunidade e contas que valem conhecer"
        action={<Link href={`/marketplace/new?mode=${showcase ? "showcase" : "market"}`} className={buttonClasses({ size: "sm" })}>Publicar</Link>}
      />

      <div className="mb-5 flex border-b border-border" role="tablist" aria-label="Tipo de publicação">
        <Link href="/marketplace" role="tab" aria-selected={!showcase} className={cn("relative px-4 py-3 text-sm font-bold transition-colors", !showcase ? "text-text" : "text-muted hover:text-text-secondary")}>
          Anúncios
          {!showcase && <span className="absolute inset-x-3 bottom-0 h-0.5 bg-brand" />}
        </Link>
        <Link href="/marketplace?mode=showcase" role="tab" aria-selected={showcase} className={cn("relative px-4 py-3 text-sm font-bold transition-colors", showcase ? "text-text" : "text-muted hover:text-text-secondary")}>
          Exposições
          {showcase && <span className="absolute inset-x-3 bottom-0 h-0.5 bg-brand" />}
        </Link>
      </div>

      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <form className="relative flex-1" action="/marketplace">
          {showcase && <input type="hidden" name="mode" value="showcase" />}
          {category && <input type="hidden" name="category" value={category} />}
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input name="q" defaultValue={params.q} maxLength={60} placeholder={showcase ? "Buscar exposições" : "Buscar no marketplace"} className="h-11 w-full rounded-xl border border-border-strong bg-surface pl-10 pr-4 text-sm text-text placeholder:text-muted focus:border-brand focus:outline-none" />
        </form>
      </div>

      {showcase ? (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-brand/20 bg-brand-tint px-4 py-3.5">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-brand" />
          <p className="text-sm leading-5 text-text-secondary"><strong className="text-text">Vitrine da comunidade.</strong> Contas aparecem aqui apenas por sua história, idade ou características raras. Não há preço, compra, troca ou transferência.</p>
        </div>
      ) : (
        <>
          <div className="no-scrollbar mb-6 flex gap-2 overflow-x-auto pb-1">
            {categories.map((item) => {
              const active = (category ?? "") === item.value;
              const href = item.value ? `/marketplace?category=${item.value}` : "/marketplace";
              return <Link key={item.value || "all"} href={href} className={cn("shrink-0 rounded-full border px-3.5 py-2 text-xs font-bold transition-colors", active ? "border-brand bg-brand-tint text-brand" : "border-border bg-surface text-text-secondary hover:border-border-strong hover:text-text")}>{item.label}</Link>;
            })}
          </div>
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-border bg-surface px-4 py-3.5">
            <SlidersHorizontal className="mt-0.5 size-5 shrink-0 text-text-secondary" />
            <p className="text-sm leading-5 text-text-secondary"><strong className="text-text">Negocie com cuidado.</strong> O DisMe não recebe pagamentos nem garante acordos externos. Nunca envie senha, token ou código de autenticação.</p>
          </div>
        </>
      )}

      {listings.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {listings.map((listing) => <ListingCard key={listing.id} listing={listing} />)}
        </div>
      ) : (
        <EmptyState
          title={showcase ? "Nenhuma conta em exposição ainda" : "Nenhum anúncio por aqui"}
          description={showcase ? "Se você tem uma conta com uma história especial, inaugure a vitrine." : "Seja a primeira pessoa a publicar algo nessa categoria."}
          action={<Link href={`/marketplace/new?mode=${showcase ? "showcase" : "market"}`} className={buttonClasses()}>{showcase ? "Criar exposição" : "Criar anúncio"}</Link>}
        />
      )}
    </PageContainer>
  );
}
