import { SectionStub } from "@/components/layout/SectionStub";

export default function ConversationPage() {
  return (
    <SectionStub
      title="Conversa"
      line="Abra uma conversa a partir da sua lista de mensagens."
      cta={{ label: "Ver mensagens", href: "/messages" }}
    />
  );
}
