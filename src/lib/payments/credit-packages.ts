export const CREDIT_PACKAGE_IDS = [
  "drop",
  "vibe",
  "aura",
  "hype",
  "elite",
  "icon",
  "insane",
] as const;

export type CreditPackageId = (typeof CREDIT_PACKAGE_IDS)[number];

export type CreditPackage = {
  id: CreditPackageId;
  name: string;
  credits: number;
  /** Valor em reais, com 2 casas. A NexusPag espera reais, não centavos. */
  amountBrl: number;
  popular?: boolean;
};

export const CREDIT_PACKAGES: readonly CreditPackage[] = [
  { id: "drop", name: "DROP", credits: 1000, amountBrl: 9.9 },
  { id: "vibe", name: "VIBE", credits: 2600, amountBrl: 24.9 },
  { id: "aura", name: "AURA", credits: 5500, amountBrl: 49.9, popular: true },
  { id: "hype", name: "HYPE", credits: 11500, amountBrl: 99.9 },
  { id: "elite", name: "ELITE", credits: 30000, amountBrl: 249.9 },
  { id: "icon", name: "ICON", credits: 65000, amountBrl: 499.9 },
  { id: "insane", name: "INSANE", credits: 140000, amountBrl: 999.9 },
];

const PACKAGE_MAP = new Map(CREDIT_PACKAGES.map((pkg) => [pkg.id, pkg]));

export function isCreditPackageId(value: string): value is CreditPackageId {
  return PACKAGE_MAP.has(value as CreditPackageId);
}

export function getCreditPackage(id: string): CreditPackage | undefined {
  return PACKAGE_MAP.get(id as CreditPackageId);
}

export function brlToCents(amount: number): number {
  return Math.round(amount * 100);
}

export function amountsMatch(a: number, b: number): boolean {
  return brlToCents(a) === brlToCents(b);
}
