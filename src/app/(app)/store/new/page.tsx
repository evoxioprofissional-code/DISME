import { redirect } from "next/navigation";
import { PageContainer } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { StoreForm } from "@/components/marketplace/StoreForm";
import { getMyProfile } from "@/lib/queries";
import { getMyStore } from "@/lib/marketplace";

export default async function NewStorePage() {
  const [me, store] = await Promise.all([getMyProfile(), getMyStore()]);
  if (!me) redirect(`/login?next=${encodeURIComponent("/store/new")}`);
  if (store) redirect("/store/manage");
  return <PageContainer className="max-w-3xl"><PageHeader title="Criar minha loja" subtitle="Seu espaço para organizar produtos e exposições" /><Card className="p-4 sm:p-6"><StoreForm username={me.username} /></Card></PageContainer>;
}
