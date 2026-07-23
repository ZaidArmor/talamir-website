import Link from 'next/link';
import type { ReactNode } from 'react';

/**
 * Layout and surface primitives.
 *
 * Every one of these composes only semantic token classes. None reads a colour,
 * radius or duration value directly, which is what lets the identity swap
 * without touching a component.
 */

const cx = (...parts: Array<string | false | undefined>): string => parts.filter(Boolean).join(' ');

/* ------------------------------------------------------------------ container */

/** Horizontal rhythm. One max-width and one gutter scale for the whole site. */
export function Container({
  children,
  className,
  width = 'default',
}: {
  children: ReactNode;
  className?: string;
  /** `prose` narrows to a reading measure for long-form text. */
  width?: 'default' | 'prose';
}) {
  return (
    <div
      className={cx(
        'mx-auto w-full px-5 sm:px-6 lg:px-8',
        width === 'prose' ? 'max-w-prose' : 'max-w-container',
        className,
      )}
    >
      {children}
    </div>
  );
}

/* -------------------------------------------------------------------- section */

/**
 * Vertical rhythm. Sections carry the site's only vertical spacing decisions,
 * so pages never invent their own margins and drift out of alignment.
 */
export function Section({
  children,
  className,
  tone = 'canvas',
  spacing = 'default',
  id,
}: {
  children: ReactNode;
  className?: string;
  /** Alternating tone is how sections separate — not borders, not shadows. */
  tone?: 'canvas' | 'surface';
  spacing?: 'default' | 'tight' | 'loose';
  id?: string;
}) {
  const pad =
    spacing === 'tight'
      ? 'py-10 md:py-14'
      : spacing === 'loose'
        ? 'py-20 md:py-32'
        : 'py-14 md:py-20';

  return (
    <section
      id={id}
      className={cx(tone === 'surface' ? 'bg-surface' : 'bg-canvas', pad, className)}
    >
      {children}
    </section>
  );
}

/* --------------------------------------------------------------------- button */

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

const buttonBase =
  'inline-flex items-center justify-center gap-2 rounded-md px-5 py-2.5 text-body-sm font-medium no-underline transition-colors duration-fast ease-standard disabled:opacity-50 disabled:pointer-events-none';

const buttonVariants: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-text-on-accent hover:bg-accent-hover',
  secondary: 'border border-border-strong bg-surface text-text hover:bg-surface-muted',
  ghost: 'text-text hover:bg-surface-muted',
};

/** A link styled as a button. Navigation is a link — always. */
export function ButtonLink({
  href: to,
  children,
  variant = 'primary',
  className,
}: {
  href: string;
  children: ReactNode;
  variant?: ButtonVariant;
  className?: string;
}) {
  return (
    <Link href={to} className={cx(buttonBase, buttonVariants[variant], className)}>
      {children}
    </Link>
  );
}

/** A real button, for real actions. */
export function Button({
  children,
  variant = 'primary',
  type = 'button',
  className,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return (
    <button type={type} className={cx(buttonBase, buttonVariants[variant], className)} {...rest}>
      {children}
    </button>
  );
}

/* ----------------------------------------------------------------------- card */

export function Card({
  children,
  className,
  interactive = false,
}: {
  children: ReactNode;
  className?: string;
  /** Adds hover affordance. Only set this when the whole card is a link. */
  interactive?: boolean;
}) {
  return (
    <div
      className={cx(
        'rounded-lg border border-border bg-surface p-6',
        interactive &&
          'transition-[border-color,box-shadow] duration-base ease-standard hover:border-border-strong hover:shadow-md',
        className,
      )}
    >
      {children}
    </div>
  );
}

/**
 * A card that is entirely one link.
 *
 * The whole surface is clickable, but the accessible name comes from the
 * heading alone — so screen-reader users get "VEXORA, link", not the card's
 * entire text content read out as one label.
 */
export function CardLink({
  href: to,
  title,
  description,
  meta,
  headingLevel = 2,
}: {
  href: string;
  title: string;
  description?: string;
  meta?: string;
  /**
   * The card's heading level, so the document outline never skips.
   *
   * Defaults to `2` — correct for a card grid following the page `h1`, which is
   * what every index page does. Pass `3` when the grid sits beneath a section
   * `h2`. Enforced by the heading-order assertion in
   * `tests/dom/accessibility.test.ts`.
   */
  headingLevel?: 2 | 3;
}) {
  const Heading = headingLevel === 2 ? 'h2' : 'h3';

  return (
    <Card interactive className="relative">
      {meta && <p className="mb-2 text-caption uppercase text-text-muted">{meta}</p>}
      <Heading className="text-h4 font-semibold">
        <Link href={to} className="text-text no-underline before:absolute before:inset-0">
          {title}
        </Link>
      </Heading>
      {description && <p className="mt-2 text-body-sm text-text-muted">{description}</p>}
    </Card>
  );
}

/* ---------------------------------------------------------------------- badge */

export function Badge({
  children,
  tone = 'neutral',
}: {
  children: ReactNode;
  tone?: 'neutral' | 'accent' | 'warning';
}) {
  const tones = {
    neutral: 'border-border bg-surface-muted text-text-muted',
    accent: 'border-transparent bg-accent-subtle text-accent',
    warning: 'border-warning bg-transparent text-warning',
  } as const;

  return (
    <span
      className={cx(
        'inline-flex items-center rounded-pill border px-2.5 py-0.5 text-caption font-medium',
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}

/* ---------------------------------------------------------------------- grid */

/**
 * The site's only grid.
 *
 * Columns are a *maximum*, not a fixed count — the grid steps down at every
 * breakpoint automatically, so no page writes its own responsive column rules.
 */
export function Grid({
  children,
  columns = 3,
  className,
}: {
  children: ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}) {
  const cols = {
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-2 lg:grid-cols-3',
    4: 'sm:grid-cols-2 lg:grid-cols-4',
  } as const;

  return <div className={cx('grid grid-cols-1 gap-5', cols[columns], className)}>{children}</div>;
}

/* --------------------------------------------------------------------- prose */

/** Long-form text. Applies the reading measure and vertical rhythm. */
export function Prose({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cx(
        'max-w-prose text-body leading-relaxed text-text',
        '[&_h2]:mt-10 [&_h2]:text-h2 [&_h2]:font-semibold',
        '[&_h3]:mt-8 [&_h3]:text-h3 [&_h3]:font-semibold',
        '[&_p]:mt-4 [&_ul]:mt-4 [&_ol]:mt-4',
        '[&_li]:mt-2 [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:ps-6 [&_ol]:ps-6',
        '[&_a]:text-accent [&_a]:underline [&_a]:underline-offset-2',
        '[&_code]:rounded-sm [&_code]:bg-surface-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-body-sm',
        className,
      )}
    >
      {children}
    </div>
  );
}
