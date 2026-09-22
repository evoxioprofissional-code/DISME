import type { Gift } from "@/types";

// Each gift maps to a hand-drawn SVG mark (see components/gifts/GiftGlyph).
// `icon` is the glyph key, never an emoji.
export const gifts: Gift[] = [
  {
    id: "rosa",
    name: "Rosa",
    rarity: "common",
    price: 40,
    category: "romanticos",
    description: "Um clássico que nunca sai de moda.",
    flexValue: 40,
  },
  {
    id: "carta",
    name: "Carta",
    rarity: "common",
    price: 60,
    category: "romanticos",
    description: "Palavras que ficam guardadas.",
    flexValue: 60,
  },
  {
    id: "ursinho",
    name: "Ursinho",
    rarity: "common",
    price: 90,
    category: "populares",
    description: "Para abraçar mesmo à distância.",
    flexValue: 90,
  },
  {
    id: "cafe",
    name: "Café da Madrugada",
    rarity: "rare",
    price: 150,
    category: "populares",
    description: "Para as calls que viram sol.",
    flexValue: 160,
  },
  {
    id: "controle",
    name: "Controle Dourado",
    rarity: "rare",
    price: 240,
    category: "colecionaveis",
    description: "Para o duo que carrega o ranqueado.",
    flexValue: 260,
  },
  {
    id: "alianca",
    name: "Aliança",
    rarity: "epic",
    price: 480,
    category: "romanticos",
    description: "Um pedido que vale um print.",
    flexValue: 520,
  },
  {
    id: "coroa",
    name: "Coroa",
    rarity: "epic",
    price: 620,
    category: "raros",
    description: "Reservada para quem lidera o Flex.",
    flexValue: 700,
  },
  {
    id: "galaxia",
    name: "Galáxia",
    rarity: "legendary",
    price: 1200,
    category: "raros",
    description: "Um universo inteiro numa caixa.",
    flexValue: 1400,
  },
  {
    id: "coroa-cristal",
    name: "Coroa de Cristal",
    rarity: "legendary",
    price: 2000,
    category: "colecionaveis",
    supply: 1000,
    minted: 337,
    description: "Cada peça é numerada e única.",
    flexValue: 2400,
  },
  {
    id: "eclipse",
    name: "Eclipse",
    rarity: "limited",
    price: 3500,
    category: "limitados",
    supply: 500,
    minted: 118,
    description: "Some quando as 500 unidades acabarem.",
    flexValue: 4200,
  },
  {
    id: "misterioso",
    name: "Presente Misterioso",
    rarity: "rare",
    price: 200,
    category: "populares",
    description: "Ninguém sabe o que tem dentro. Nem você.",
    flexValue: 220,
  },
  {
    id: "trono",
    name: "Trono",
    rarity: "limited",
    price: 5000,
    category: "limitados",
    supply: 100,
    minted: 41,
    description: "Só cem pessoas terão. Uma delas pode ser você.",
    flexValue: 6000,
  },
];

const PRESENTATION: Record<string, Pick<Gift, "name" | "description" | "asset" | "displayCategory" | "featured">> = {
  rosa: { name: "Heartbroken", description: "acontece.", asset: "/presentes/coração.png", displayCategory: "romance", featured: true },
  carta: { name: "e-kitten", description: "certified.", asset: "/presentes/gato.png", displayCategory: "aura", featured: true },
  ursinho: { name: "Aura", description: "+ aura.", asset: "/presentes/estrelas.png", displayCategory: "aura", featured: true },
  cafe: { name: "Lighter", description: "acende aí.", asset: "/presentes/isqueiro.png", displayCategory: "larp", featured: true },
  controle: { name: "Lean", description: "purple.", asset: "/presentes/lean.png", displayCategory: "gaming", featured: true },
  alianca: { name: "Masked", description: "ninguém precisa saber.", asset: "/presentes/mascara.png", displayCategory: "larp", featured: true },
  coroa: { name: "Void", description: "sumiu.", asset: "/presentes/lua-negra.png", displayCategory: "colecionáveis", featured: true },
  galaxia: { name: "Dragon", description: "final boss.", asset: "/presentes/dragão.png", displayCategory: "gaming", featured: true },
};

export function decorateGift(gift: Gift): Gift {
  return { ...gift, ...PRESENTATION[gift.id] };
}

export function giftHasAsset(gift: Gift) {
  return Boolean(gift.asset);
}

const giftMap = new Map(gifts.map((g) => [g.id, decorateGift(g)]));

export function getGift(id: string): Gift | undefined {
  return giftMap.get(id);
}

export const rarityLabel: Record<Gift["rarity"], string> = {
  common: "Comum",
  rare: "Raro",
  epic: "Épico",
  legendary: "Lendário",
  limited: "Limitado",
};

export const rarityColorVar: Record<Gift["rarity"], string> = {
  common: "var(--color-rarity-common)",
  rare: "var(--color-rarity-rare)",
  epic: "var(--color-rarity-epic)",
  legendary: "var(--color-rarity-legendary)",
  limited: "var(--color-rarity-limited)",
};
