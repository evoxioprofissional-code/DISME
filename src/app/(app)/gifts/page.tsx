import { PageContainer } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { GiftStore } from "@/components/gifts/GiftStore";

export default async function GiftsPage({
  searchParams,
}: {
  searchParams: Promise<{ to?: string }>;
}) {
  const { to } = await searchParams;
  return (
    <PageContainer className="max-w-4xl">
      <PageHeader title="Presentes" subtitle="Envie algo que a pessoa vai guardar" />
      <GiftStore presetUsername={to} />
    </PageContainer>
  );
}
