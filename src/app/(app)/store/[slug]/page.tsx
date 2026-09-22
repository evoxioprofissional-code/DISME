import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, MessageCircle, Package, Settings, ShieldCheck, Store as StoreIcon } from "lucide-react";
import { PageContainer } from "@/components/layout/AppShell";
import { Avatar } from "@/components/ui/Avatar";
import { Chip } from "@/components/ui/Chip";
import { EmptyState } from "@/components/ui/EmptyState";
import { buttonClasses } from "@/components/ui/Button";
import { ListingCard } from "@/components/marketplace/ListingCard";
import { getSessionUserId } from "@/lib/queries";
import { getStoreBySlug, listStoreListings } from "@/lib/marketplace";

export default async function PublicStorePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const store = await getStoreBySlug(slug);
  if (!store) notFound();
  const [meId, listings] = await Promise.all([getSessionUserId(), listStoreListings(store.id, store.ownerId)]);
  const products = listings.filter((item) => item.kind === "market" && item.status === "active");
  const showcases = listings.filter((item) => item.kind === "showcase" && item.status === "active");
  const isOwner = meId === store.ownerId;
  const discordUrl = store.owner.discordId ? `https://discord.com/users/${store.owner.discordId}` : null;
  return (
    <PageContainer className="max-w-6xl px-0 sm:px-6">
      <div className="overflow-hidden border-y border-border bg-surface sm:rounded-3xl sm:border">
        <div className="relative h-40 bg-surface-2 sm:h-56">{store.banner ? <Image src={store.banner} alt="" fill priority sizes="1100px" className="object-cover" /> : <div className="flex size-full items-center justify-center text-muted"><StoreIcon className="size-12" strokeWidth={1.3} /></div>}</div>
        <div className="px-4 pb-6 sm:px-6"><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div className="-mt-10 min-w-0"><Avatar src={store.avatar || store.owner.avatar} name={store.name} size="2xl" rounded="xl" className="rounded-2xl ring-4 ring-surface" /><h1 className="mt-3 text-2xl font-extrabold tracking-tight text-text">{store.name}</h1><Link href={`/profile/${store.owner.username}`} className="mt-1 inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text"><Avatar src={store.owner.avatar} name={store.owner.displayName} size="xs" /> por @{store.owner.username}</Link></div><div className="flex gap-2">{isOwner ? <Link href="/store/manage" className={buttonClasses()}><Settings className="size-4" /> Gerenciar loja</Link> : discordUrl ? <a href={discordUrl} target="_blank" rel="noreferrer" className={buttonClasses()}><MessageCircle className="size-4" /> Falar no Discord <ExternalLink className="size-3.5" /></a> : <Link href={`/profile/${store.owner.username}`} className={buttonClasses()}>Ver perfil</Link>}</div></div>{store.description && <p className="mt-5 max-w-2xl text-[15px] leading-6 text-text-secondary">{store.description}</p>}<div className="mt-4 flex gap-2"><Chip icon={<Package />}>{products.length} {products.length === 1 ? "produto" : "produtos"}</Chip>{showcases.length > 0 && <Chip variant="brand" icon={<ShieldCheck />}>{showcases.length} {showcases.length === 1 ? "exposição" : "exposições"}</Chip>}</div></div>
      </div>
      <div className="px-4 sm:px-0">
        <section className="mt-8"><h2 className="mb-4 text-lg font-extrabold text-text">Produtos</h2>{products.length ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{products.map((item, index) => <ListingCard key={item.id} listing={item} priority={index === 0 && !store.banner} />)}</div> : <EmptyState title="Nenhum produto disponível" description="Esta loja ainda não publicou produtos ativos." />}</section>
        {showcases.length > 0 && <section className="mt-9"><h2 className="mb-4 text-lg font-extrabold text-text">Exposições</h2><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{showcases.map((item) => <ListingCard key={item.id} listing={item} />)}</div></section>}
      </div>
    </PageContainer>
  );
}
