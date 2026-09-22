import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Eye, Package, Pencil, Plus, Store as StoreIcon } from "lucide-react";
import { PageContainer } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Chip } from "@/components/ui/Chip";
import { buttonClasses } from "@/components/ui/Button";
import { ManageListingActions } from "@/components/marketplace/ManageListingActions";
import { getMyProfile } from "@/lib/queries";
import { getMyStore, listMyStoreListings } from "@/lib/marketplace";
import { marketplaceCategoryLabels } from "@/types/marketplace";

export default async function ManageStorePage() {
  const me = await getMyProfile();
  if (!me) redirect(`/login?next=${encodeURIComponent("/store/manage")}`);
  const store = await getMyStore();
  if (!store) redirect("/store/new");
  const listings = await listMyStoreListings();
  return (
    <PageContainer className="max-w-5xl">
      <PageHeader title="Minha loja" subtitle="Gerencie sua vitrine e suas publicações" action={<Link href="/marketplace/new" className={buttonClasses({ size: "sm" })}><Plus className="size-4" /> Novo produto</Link>} />
      <Card className="mb-6 overflow-hidden">
        <div className="relative h-32 bg-surface-2">{store.banner ? <Image src={store.banner} alt="" fill sizes="900px" className="object-cover" /> : <div className="flex size-full items-center justify-center text-muted"><StoreIcon className="size-9" /></div>}</div>
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0"><h2 className="text-xl font-extrabold text-text">{store.name}</h2><p className="mt-1 text-sm text-text-secondary">disme.cloud/store/{store.slug}</p><div className="mt-2"><Chip variant={store.isPublished ? "brand" : "outline"}>{store.isPublished ? "Loja pública" : "Loja oculta"}</Chip></div></div>
          <div className="flex gap-2"><Link href={`/store/${store.slug}`} className={buttonClasses({ variant: "outline", size: "sm" })}><Eye className="size-4" /> Ver loja</Link><Link href="/store/manage/edit" className={buttonClasses({ variant: "secondary", size: "sm" })}><Pencil className="size-4" /> Editar loja</Link></div>
        </div>
      </Card>
      <div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-extrabold text-text">Publicações <span className="text-muted">· {listings.length}</span></h2><Link href="/marketplace/new?mode=showcase" className="text-sm font-bold text-brand">Criar exposição</Link></div>
      {listings.length ? <div className="space-y-3">{listings.map((listing) => <Card key={listing.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center"><div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-surface-2">{listing.images[0] ? <Image src={listing.images[0]} alt="" fill sizes="80px" className="object-cover" /> : <div className="flex size-full items-center justify-center"><Package className="size-6 text-muted" /></div>}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="truncate text-sm font-extrabold text-text">{listing.title}</h3><Chip variant={listing.status === "active" ? "brand" : "outline"}>{listing.status === "active" ? "Ativo" : "Pausado"}</Chip></div><p className="mt-1 text-xs text-text-secondary">{marketplaceCategoryLabels[listing.category]}</p></div><ManageListingActions listing={listing} /></Card>)}</div> : <EmptyState title="Sua loja ainda está vazia" description="Publique o primeiro produto ou crie uma exposição." action={<Link href="/marketplace/new" className={buttonClasses()}>Adicionar produto</Link>} />}
    </PageContainer>
  );
}
