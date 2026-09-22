import { redirect } from "next/navigation";
import { PageContainer } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { StoreForm } from "@/components/marketplace/StoreForm";
import { getMyProfile } from "@/lib/queries";
import { getMyStore } from "@/lib/marketplace";

export default async function EditStorePage() {
  const [me, store] = await Promise.all([getMyProfile(), getMyStore()]);
  if (!me) redirect("/login");
  if (!store) redirect("/store/new");
  return <PageContainer className="max-w-3xl"><PageHeader title="Editar loja" subtitle="Ajuste a identidade e a visibilidade da sua loja" /><Card className="p-4 sm:p-6"><StoreForm store={store} username={me.username} /></Card></PageContainer>;
}
