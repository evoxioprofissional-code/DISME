import { PageContainer } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Settings } from "@/components/settings/Settings";
import { LoginCta } from "@/components/auth/LoginCta";
import { getMyProfile, getMyEmail } from "@/lib/queries";

type Platform = "steam" | "spotify" | "riot" | "twitch";

export default async function SettingsPage() {
  const [me, email] = await Promise.all([getMyProfile(), getMyEmail()]);

  return (
    <PageContainer>
      <PageHeader title="Configurações" />
      {me ? (
        <Settings
          email={email ?? "—"}
          initialHidden={me.isHidden ?? false}
          initialPresence={me.presence}
          connections={Object.fromEntries(
            me.connections
              .filter((c) => ["steam", "spotify", "riot", "twitch"].includes(c.platform))
              .map((c) => [c.platform, c.handle]),
          ) as Partial<Record<Platform, string>>}
        />
      ) : (
        <LoginCta
          title="Entre para ver suas configurações"
          description="Conta, privacidade, conexões e notificações ficam aqui depois que você entra."
        />
      )}
    </PageContainer>
  );
}
