import { Card } from "@/components/ui/Card";

/**
 * "Nosso Espaço" — a flat 2D concept of the couple's customizable room.
 * Special gifts will later become objects here. Refined, not childish.
 */
export function CoupleRoom({ petName }: { petName?: string }) {
  return (
    <Card className="overflow-hidden">
      <svg viewBox="0 0 400 220" className="block w-full" role="img" aria-label="Nosso Espaço">
        {/* wall + floor */}
        <rect x="0" y="0" width="400" height="152" fill="var(--color-surface-2)" />
        <rect x="0" y="152" width="400" height="68" fill="var(--color-surface-3)" />
        <line x1="0" y1="152" x2="400" y2="152" stroke="var(--color-border)" strokeWidth="1" />

        {/* framed picture */}
        <rect x="42" y="30" width="76" height="56" rx="6" fill="var(--color-surface)" stroke="var(--color-brand)" strokeWidth="2" />
        <circle cx="72" cy="60" r="11" fill="none" stroke="var(--color-text-secondary)" strokeWidth="2" />
        <circle cx="86" cy="60" r="11" fill="none" stroke="var(--color-brand)" strokeWidth="2" />

        {/* shelf with collectibles */}
        <rect x="250" y="66" width="96" height="5" rx="2.5" fill="var(--color-border-strong)" />
        <path d="M266 66l-6-14 6 4 6-9 6 9 6-4-6 14Z" fill="none" stroke="var(--color-rarity-legendary)" strokeWidth="2" strokeLinejoin="round" />
        <circle cx="320" cy="56" r="9" fill="none" stroke="var(--color-rarity-epic)" strokeWidth="2" />

        {/* floor lamp */}
        <line x1="360" y1="152" x2="360" y2="92" stroke="var(--color-border-strong)" strokeWidth="3" strokeLinecap="round" />
        <path d="M348 92h24l-6 16h-12Z" fill="var(--color-surface)" stroke="var(--color-border-strong)" strokeWidth="2" strokeLinejoin="round" />
        <circle cx="360" cy="104" r="3" fill="var(--color-rarity-legendary)" opacity="0.6" />
        <ellipse cx="360" cy="150" rx="14" ry="4" fill="var(--color-border-strong)" />

        {/* plant */}
        <path d="M46 150h26l-4 20H50Z" fill="var(--color-surface)" stroke="var(--color-border-strong)" strokeWidth="2" strokeLinejoin="round" />
        <path d="M59 150c-2-14-10-16-14-16 0 10 6 15 14 16ZM59 150c2-12 9-15 14-15 0 9-6 14-14 15Z" fill="none" stroke="var(--color-success)" strokeWidth="2" strokeLinejoin="round" />

        {/* rug */}
        <ellipse cx="205" cy="188" rx="86" ry="15" fill="var(--color-surface-2)" />

        {/* pet */}
        <g transform="translate(178,150)">
          <path d="M6 26c0-8 6-14 18-14s18 6 18 14c0 3-1 5-4 7-3 1-8 2-14 2s-11-1-14-2c-3-2-4-4-4-7Z" fill="var(--color-surface)" stroke="var(--color-brand)" strokeWidth="2" strokeLinejoin="round" />
          <circle cx="18" cy="24" r="2.4" fill="var(--color-text)" />
          <circle cx="30" cy="24" r="2.4" fill="var(--color-text)" />
          <path d="M20 30c2 1.5 6 1.5 8 0" stroke="var(--color-text-secondary)" strokeWidth="2" strokeLinecap="round" />
          <rect x="15" y="33" width="18" height="4" rx="2" fill="var(--color-brand)" />
        </g>
      </svg>
      <div className="flex items-center justify-between px-4 py-3">
        <p className="text-sm text-text-secondary">
          {petName ? `${petName} está no espaço de vocês.` : "O espaço de vocês."} Presentes
          especiais viram objetos aqui.
        </p>
      </div>
    </Card>
  );
}
