import type { Intent, RelationshipStatus, SocialConnection } from "@/types";

export const intentMeta: Record<Intent, { label: string; icon: string }> = {
  namoro: { label: "Namoro", icon: "heart" },
  amizade: { label: "Amizade", icon: "users" },
  duo: { label: "Duo", icon: "swords" },
  conversar: { label: "Conversar", icon: "message-circle" },
};

export const relationshipMeta: Record<RelationshipStatus, string> = {
  solteiro: "Solteiro(a)",
  namorando: "Namorando",
  webnamoro: "Webnamoro",
  complicado: "É complicado",
  reservado: "Reservado(a)",
};

export const connectionMeta: Record<
  SocialConnection["platform"],
  { label: string; icon: string }
> = {
  steam: { label: "Steam", icon: "gamepad-2" },
  spotify: { label: "Spotify", icon: "music" },
  riot: { label: "Riot", icon: "swords" },
  twitch: { label: "Twitch", icon: "tv" },
  discord: { label: "Discord", icon: "message-square" },
};
