import { SectionStub } from "@/components/layout/SectionStub";

export default function MessagesPage() {
  return (
    <SectionStub
      title="Mensagens"
      subtitle="Suas conversas"
      line="As conversas com quem deu match ficam aqui, prontas para a próxima call."
      cta={{ label: "Ir para Descobrir", href: "/discover" }}
    />
  );
}
