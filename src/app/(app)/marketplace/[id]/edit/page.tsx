import { notFound, redirect } from "next/navigation";
import { PageContainer } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { ListingForm } from "@/components/marketplace/ListingForm";
import { getMarketplaceListing } from "@/lib/marketplace";
import { getSessionUserId } from "@/lib/queries";

export default async function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [meId, listing] = await Promise.all([getSessionUserId(), getMarketplaceListing(id)]);
  if (!meId) redirect(`/login?next=${encodeURIComponent(`/marketplace/${id}/edit`)}`);
  if (!listing || listing.sellerId !== meId) notFound();
  return <PageContainer className="max-w-3xl"><PageHeader title="Editar publicação" subtitle={`Na loja ${listing.store.name}`} /><Card className="p-4 sm:p-6"><ListingForm listing={listing} /></Card></PageContainer>;
}
