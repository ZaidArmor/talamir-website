/**
 * The four "what TALAMIR builds" icons, and the arc that marks each entity
 * chapter.
 *
 * Drawn inline against colour tokens rather than shipped as files: they are
 * two-tone line marks whose emphasis colour is the identity's accent, so as
 * files they would need re-exporting every time the identity moved.
 */

const STROKE = { fill: 'none', strokeWidth: 2.4 } as const;
const QUIET = { fill: 'none', strokeWidth: 2.2, stroke: 'var(--color-border-strong)' } as const;

export function BuildIcon({ index }: { index: number }) {
  const common = {
    viewBox: '0 0 44 44',
    className: 'lp-card-ico',
    'aria-hidden': true as const,
    focusable: 'false' as const,
    fill: 'none',
  };
  const accent = 'var(--color-accent)';

  switch (index) {
    case 0:
      return (
        <svg {...common}>
          <circle cx="10" cy="12" r="4" stroke={accent} {...STROKE} />
          <rect x="20" y="8" width="16" height="9" rx="2" stroke={accent} {...STROKE} />
          <rect x="8" y="24" width="28" height="12" rx="2" {...QUIET} />
        </svg>
      );
    case 1:
      return (
        <svg {...common}>
          <path
            d="M12 30h20a7 7 0 0 0 0-14 9 9 0 0 0-17-2 6 6 0 0 0-3 16z"
            stroke={accent}
            {...STROKE}
          />
        </svg>
      );
    case 2:
      return (
        <svg {...common}>
          <circle cx="22" cy="22" r="7" stroke={accent} {...STROKE} />
          <path d="M22 6v6M22 32v6M6 22h6M32 22h6" {...QUIET} />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="5" stroke={accent} {...STROKE} />
          <circle cx="33" cy="33" r="5" stroke={accent} {...STROKE} />
          <circle cx="33" cy="11" r="5" {...QUIET} />
          <path d="M15 13l14 18M15 11h13" {...QUIET} />
        </svg>
      );
  }
}

/** The large arc beside the SULTAN deep dive. */
export function SultanArc() {
  return (
    <svg viewBox="0 0 200 200" width={170} aria-hidden="true" focusable="false">
      <circle cx="100" cy="100" r="78" fill="none" stroke="var(--color-border-subtle)" />
      <path
        d="M100 22 A78 78 0 0 1 178 100"
        stroke="var(--color-accent)"
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
      />
      <circle
        cx="100"
        cy="100"
        r="46"
        fill="none"
        stroke="var(--color-accent-deep)"
        strokeWidth="2"
        strokeDasharray="200 90"
      />
      <circle cx="100" cy="100" r="12" fill="var(--color-accent)" />
      <circle cx="178" cy="100" r="6" fill="var(--color-accent-hover)" />
    </svg>
  );
}

/** The smaller arc that heads each remaining entity chapter. */
export function ChapterArc({ accentRole }: { accentRole: string }) {
  const colour = `var(--color-${accentRole})`;
  return (
    <svg viewBox="0 0 160 160" width={130} aria-hidden="true" focusable="false">
      <circle cx="80" cy="80" r="60" fill="none" stroke="var(--color-border-subtle)" />
      <path
        d="M80 20 A60 60 0 0 1 140 80"
        stroke={colour}
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="80" cy="80" r="10" fill={colour} />
    </svg>
  );
}
