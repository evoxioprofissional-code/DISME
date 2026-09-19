/** DisMe's own "crush" mark — a four-point spark, deliberately not a heart. */
export function CrushIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M12 1.5c.5 4.3 1.9 5.7 6.2 6.2v.6c-4.3.5-5.7 1.9-6.2 6.2h-.6c-.5-4.3-1.9-5.7-6.2-6.2v-.6C9.7 7.2 11.1 5.8 11.4 1.5Z" />
      <path d="M18.5 14.2c.3 2.4 1 3.1 3.4 3.4v.4c-2.4.3-3.1 1-3.4 3.4h-.4c-.3-2.4-1-3.1-3.4-3.4v-.4c2.4-.3 3.1-1 3.4-3.4Z" />
    </svg>
  );
}
