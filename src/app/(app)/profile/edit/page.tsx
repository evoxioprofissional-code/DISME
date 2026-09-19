import { PageContainer } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProfileEditForm } from "@/components/profile/ProfileEditForm";
import { getMyProfile } from "@/lib/queries";
import { redirect } from "next/navigation";

export default async function ProfileEditPage() {
  const me = await getMyProfile();
  if (!me) redirect("/login");
  return (
    <PageContainer>
      <PageHeader title="Editar perfil" />
      <ProfileEditForm user={me} />
    </PageContainer>
  );
}
