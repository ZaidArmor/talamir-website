/**
 * A call-to-action that leaves the site.
 *
 * One place owns the rules for an external link so they cannot drift: it opens
 * in a new tab, carries `rel="noopener noreferrer"`, shows a visible marker so
 * a sighted user knows it leaves the site, and appends an sr-only "opens in a
 * new tab" to its accessible name. Keyboard activation and the visible focus
 * ring come from its being a real anchor.
 *
 * It carries no form data and no query string — the href is exactly the
 * approved destination, nothing appended.
 */
export function ExternalCta({
  href,
  label,
  newTabHint,
  className = 'lp-btn lp-btn-ghost lp-btn-sm',
}: {
  href: string;
  /** The visible, descriptive link text and the base of its accessible name. */
  label: string;
  /** Localized "(opens in a new tab)", appended sr-only to the accessible name. */
  newTabHint: string;
  className?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      aria-label={`${label} ${newTabHint}`}
    >
      <span>{label}</span>
      <span className="lp-external-mark" aria-hidden="true">
        ↗
      </span>
    </a>
  );
}
