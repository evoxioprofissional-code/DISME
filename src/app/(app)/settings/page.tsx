import { PageContainer } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Settings } from "@/components/settings/Settings";

export default function SettingsPage() {
  return (
    <PageContainer>
      <PageHeader title="Configurações" />
      <Settings />
    </PageContainer>
  );
}
