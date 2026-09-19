import type { Game } from "@/types";

export const games: Game[] = [
  { id: "cs2", name: "Counter-Strike 2", short: "CS2" },
  { id: "valorant", name: "Valorant", short: "VALO" },
  { id: "lol", name: "League of Legends", short: "LoL" },
  { id: "minecraft", name: "Minecraft", short: "MC" },
  { id: "fortnite", name: "Fortnite", short: "FN" },
  { id: "gta", name: "GTA V", short: "GTA" },
  { id: "genshin", name: "Genshin Impact", short: "GI" },
  { id: "overwatch", name: "Overwatch 2", short: "OW2" },
  { id: "apex", name: "Apex Legends", short: "APEX" },
  { id: "roblox", name: "Roblox", short: "RBLX" },
  { id: "amongus", name: "Among Us", short: "AU" },
  { id: "stardew", name: "Stardew Valley", short: "SV" },
  { id: "eldenring", name: "Elden Ring", short: "ER" },
  { id: "rocketleague", name: "Rocket League", short: "RL" },
];

const gameMap = new Map(games.map((g) => [g.id, g]));

export function getGame(id: string): Game | undefined {
  return gameMap.get(id);
}
