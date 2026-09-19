import { SectionStub } from "@/components/layout/SectionStub";

export default function FlexPage() {
  return (
    <SectionStub
      title="Flex"
      subtitle="Seu status no DisMe"
      line="Pontuação, evolução e sua posição no ranking de Flex chegam na próxima etapa."
      cta={{ label: "Ver ranking", href: "/rankings" }}
    />
  );
}
