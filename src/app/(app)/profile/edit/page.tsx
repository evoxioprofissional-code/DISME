import { currentUser } from "@/data";
import { PageContainer } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProfileEditForm } from "@/components/profile/ProfileEditForm";

export default function ProfileEditPage() {
  const me = currentUser();
  return (
    <PageContainer>
      <PageHeader title="Editar perfil" />
      <ProfileEditForm user={me} />
    </PageContainer>
  );
}
