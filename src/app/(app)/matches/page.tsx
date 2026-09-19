import { SectionStub } from "@/components/layout/SectionStub";

export default function MatchesPage() {
  return (
    <SectionStub
      title="Matches"
      subtitle="Quem também curtiu você"
      line="Seus matches vão aparecer aqui. Vá para Descobrir e comece a curtir."
      cta={{ label: "Ir para Descobrir", href: "/discover" }}
    />
  );
}
