/**
 * The TALAMIR mark, drawn inline.
 *
 * Inline rather than an <img> for the same reason the approved design draws it
 * inline: the mark appears in the header, the preloader, the ecosystem core and
 * the closing card, and it must be painted in the first frame in all four —
 * a fetched image would pop in after the fold has already settled.
 *
 * `brand.logo.asset` still points at the standalone file; that is what social
 * cards and structured data reference, where an inline SVG cannot go.
 *
 * The stroke is the identity's accent, so it is read from the token rather than
 * written here — the mark recolours with the brand like everything else.
 */
export function Mark({ size = 34, className }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <circle
        cx="50"
        cy="50"
        r="34"
        fill="none"
        stroke="var(--color-accent)"
        strokeWidth="11"
        strokeLinecap="round"
        strokeDasharray="168 46"
      />
      <circle cx="50" cy="50" r="12" fill="var(--color-accent)" />
      <circle cx="87.6" cy="36.3" r="5" fill="var(--color-accent-hover)" />
    </svg>
  );
}

/** The same geometry, spinning — used only by the preloader. */
export function SpinningMark({ size = 72 }: { size?: number }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true" focusable="false">
      <circle
        className="lp-preloader-orbit"
        cx="50"
        cy="50"
        r="34"
        fill="none"
        stroke="var(--color-accent)"
        strokeWidth="11"
        strokeLinecap="round"
        strokeDasharray="168 46"
      />
      <circle cx="50" cy="50" r="12" fill="var(--color-accent)" />
    </svg>
  );
}
