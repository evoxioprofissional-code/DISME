import { redirect } from "next/navigation";
import { PageContainer } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { ListingForm } from "@/components/marketplace/ListingForm";
import { getSessionUserId } from "@/lib/queries";

export default async function NewMarketplaceListingPage({ searchParams }: { searchParams: Promise<{ mode?: string }> }) {
  const meId = await getSessionUserId();
  const params = await searchParams;
  if (!meId) {
    const destination = `/marketplace/new${params.mode === "showcase" ? "?mode=showcase" : ""}`;
    redirect(`/login?next=${encodeURIComponent(destination)}`);
  }
  return (
    <PageContainer className="max-w-3xl">
      <PageHeader title="Nova publicação" subtitle="Mostre o que importa com informações claras" />
      <Card className="p-4 sm:p-6">
        <ListingForm initialKind={params.mode === "showcase" ? "showcase" : "market"} />
      </Card>
    </PageContainer>
  );
}
