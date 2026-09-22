import { notFound, redirect } from "next/navigation";
import { PageContainer } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { ServerListingForm } from "@/components/servers/ServerListingForm";
import { getDiscordServer } from "@/lib/server-directory";
import { getSessionUserId } from "@/lib/queries";

export default async function EditServerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [meId, server] = await Promise.all([getSessionUserId(), getDiscordServer(id)]);
  if (!meId) redirect(`/login?next=${encodeURIComponent(`/server/${id}/edit`)}`);
  if (!server || server.ownerProfileId !== meId) notFound();
  return <PageContainer className="max-w-3xl"><PageHeader title="Editar servidor" subtitle="Os dados oficiais serão sincronizados novamente ao salvar" /><Card className="p-4 sm:p-6"><ServerListingForm server={server} /></Card></PageContainer>;
}
