import type { DiscordBadge } from "@/types/discord";

const BADGE_DEFINITIONS: Array<{
  flag: number;
  id: string;
  name: string;
  icon: string;
  description: string;
}> = [
  { flag: 1 << 0, id: "staff", name: "Discord Staff", icon: "shield", description: "Equipe oficial do Discord." },
  { flag: 1 << 1, id: "partner", name: "Partnered Server Owner", icon: "handshake", description: "Proprietário de servidor parceiro." },
  { flag: 1 << 2, id: "hypesquad-events", name: "HypeSquad Events", icon: "sparkles", description: "Membro do HypeSquad Events." },
  { flag: 1 << 3, id: "bug-hunter", name: "Bug Hunter", icon: "bug", description: "Participante do programa Bug Hunter." },
  { flag: 1 << 6, id: "hypesquad-bravery", name: "HypeSquad Bravery", icon: "flame", description: "Casa Bravery do HypeSquad." },
  { flag: 1 << 7, id: "hypesquad-brilliance", name: "HypeSquad Brilliance", icon: "gem", description: "Casa Brilliance do HypeSquad." },
  { flag: 1 << 8, id: "hypesquad-balance", name: "HypeSquad Balance", icon: "scale", description: "Casa Balance do HypeSquad." },
  { flag: 1 << 9, id: "early-supporter", name: "Early Supporter", icon: "heart", description: "Apoiador inicial do Discord." },
  { flag: 1 << 14, id: "bug-hunter-2", name: "Bug Hunter Nível 2", icon: "bug", description: "Nível 2 do programa Bug Hunter." },
  { flag: 1 << 16, id: "verified-bot", name: "Verified Bot", icon: "bot", description: "Bot verificado pelo Discord." },
  { flag: 1 << 17, id: "verified-developer", name: "Verified Developer", icon: "code", description: "Desenvolvedor verificado legado." },
  { flag: 1 << 18, id: "moderator-alumni", name: "Moderator Program Alumni", icon: "gavel", description: "Ex-integrante do programa de moderadores." },
  { flag: 1 << 22, id: "active-developer", name: "Active Developer", icon: "terminal", description: "Desenvolvedor ativo reconhecido pelo Discord." },
];

export function resolveBadges(input: number | { publicFlags?: number; premiumType?: number | null; premiumSince?: string | null } = 0): DiscordBadge[] {
  const publicFlags = typeof input === "number" ? input : input.publicFlags ?? 0;
  const badges: DiscordBadge[] = BADGE_DEFINITIONS.filter((definition) => (publicFlags & definition.flag) === definition.flag).map((definition) => ({
    id: definition.id,
    name: definition.name,
    icon: definition.icon,
    description: definition.description,
    key: definition.id,
    label: definition.name,
    source: "discord" as const,
    since: null,
  }));
  if (typeof input !== "number" && input.premiumType && input.premiumType > 0) {
    badges.push({
      id: "nitro",
      name: input.premiumType === 3 ? "Nitro Basic" : input.premiumType === 1 ? "Nitro Classic" : "Nitro",
      icon: "sparkles",
      description: "Assinatura Nitro retornada pelo Discord.",
      key: "nitro",
      label: input.premiumType === 3 ? "Nitro Basic" : input.premiumType === 1 ? "Nitro Classic" : "Nitro",
      source: "discord",
      since: input.premiumSince ?? null,
    });
  }
  return badges;
}
