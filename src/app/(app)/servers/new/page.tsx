import { redirect } from "next/navigation";
import { PageContainer } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { ServerListingForm } from "@/components/servers/ServerListingForm";
import { getSessionUserId } from "@/lib/queries";

export default async function NewServerListingPage() {
  if (!await getSessionUserId()) redirect(`/login?next=${encodeURIComponent("/servers/new")}`);
  return <PageContainer className="max-w-3xl"><PageHeader title="Anunciar servidor" subtitle="Importe as informações oficiais do seu servidor Discord" /><Card className="p-4 sm:p-6"><ServerListingForm /></Card></PageContainer>;
}
