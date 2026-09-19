import { SectionStub } from "@/components/layout/SectionStub";

export default function SettingsPage() {
  return (
    <SectionStub
      title="Configurações"
      subtitle="Conta e privacidade"
      line="Controle de mensagens, privacidade, conexões e preferências chegam em breve."
      cta={{ label: "Voltar ao Início", href: "/home" }}
    />
  );
}
