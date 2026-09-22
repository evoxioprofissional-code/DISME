import { PageContainer } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProfileEditForm } from "@/components/profile/ProfileEditForm";
import { LoginCta } from "@/components/auth/LoginCta";
import { getMyProfile } from "@/lib/queries";

export default async function ProfileEditPage() {
  const me = await getMyProfile();
  return (
    <PageContainer>
      <PageHeader title="Editar perfil" />
      {me ? (
        <ProfileEditForm user={me} />
      ) : (
        <LoginCta
          title="Entre para editar seu perfil"
          description="Crie sua conta para personalizar foto, capa, bio, jogos e interesses."
        />
      )}
    </PageContainer>
  );
}
