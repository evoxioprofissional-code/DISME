import { PageContainer } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { GiftStore } from "@/components/gifts/GiftStore";
import { getMyCredits, getSessionUserId, getProfileByUsername, listGiftCatalog, listSuggestions } from "@/lib/queries";

export default async function GiftsPage({
  searchParams,
}: {
  searchParams: Promise<{ to?: string }>;
}) {
  const { to } = await searchParams;
  const meId = await getSessionUserId();
  const [gifts, candidates, presetUser, credits] = await Promise.all([
    listGiftCatalog(),
    listSuggestions(meId, 20),
    to ? getProfileByUsername(to) : Promise.resolve(null),
    getMyCredits(),
  ]);
  return (
    <PageContainer className="max-w-4xl">
      <PageHeader title="Presentes" subtitle="Envie algo que a pessoa vai guardar" />
      <GiftStore gifts={gifts} credits={credits} candidates={candidates} presetUser={presetUser ?? undefined} />
    </PageContainer>
  );
}
