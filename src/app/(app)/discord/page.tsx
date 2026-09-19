import { DiscordLookup } from "@/components/discord/DiscordLookup";
import { PageContainer } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";

export default function DiscordLookupPage() {
  return (
    <PageContainer className="max-w-4xl px-0 sm:px-6">
      <PageHeader
        title="Consulta Discord"
        subtitle="Encontre a identidade pública atual de qualquer conta pelo ID"
        className="px-4 sm:px-0"
      />
      <DiscordLookup />
    </PageContainer>
  );
}
