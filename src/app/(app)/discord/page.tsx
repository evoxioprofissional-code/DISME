import { DiscordLookup } from "@/components/discord/DiscordLookup";
import { PageContainer } from "@/components/layout/AppShell";

export default function DiscordLookupPage() {
  return (
    <PageContainer className="max-w-6xl px-0 sm:px-6">
      <DiscordLookup />
    </PageContainer>
  );
}
