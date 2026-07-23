import Link from 'next/link';
import type { ReactNode } from 'react';
import { brand, isPlaceholderIdentity } from '@brand/index';
import type { Locale } from '@/content/types';
import { href, t, ui } from '@/lib/i18n';
import { ButtonLink, Container, Grid, Section } from '@/components/ui/primitives';
import { Reveal } from '@/components/ui/Reveal';

/**
 * Page-level blocks.
 *
 * Pages are assembled from these; they do not write bespoke layout. That is
 * what keeps twenty-odd routes visually coherent, and it is what lets a future
 * product page exist without a designer touching it.
 */

/* ------------------------------------------------------------------- ribbon */

/**
 * The placeholder ribbon.
 *
 * Renders site-wide while the identity is unapproved, and disappears entirely
 * on sign-off — no flag to remember, no copy to delete. It exists so that no
 * internal reviewer or stakeholder can mistake this build for a finished look.
 */
export function PlaceholderRibbon({ locale }: { locale: Locale }) {
  if (!isPlaceholderIdentity || !brand.notice) return null;

  return (
    <div className="border-b border-warning bg-canvas">
      <Container>
        <p className="py-2 text-caption text-warning">{t(brand.notice, locale)}</p>
      </Container>
    </div>
  );
}

/* -------------------------------------------------------------- page header */

/** The standard opening of every interior page. */
export function PageHeader({
  eyebrow,
  title,
  lede,
  children,
}: {
  eyebrow?: string;
  title: string;
  lede?: string;
  children?: ReactNode;
}) {
  return (
    <Section spacing="tight">
      <Container>
        {eyebrow && (
          <p className="mb-3 text-caption font-medium uppercase text-text-muted">{eyebrow}</p>
        )}
        <h1 className="text-h1 font-bold">{title}</h1>
        {lede && <p className="mt-4 max-w-prose text-body-lg text-text-muted">{lede}</p>}
        {children && <div className="mt-6">{children}</div>}
      </Container>
    </Section>
  );
}

/* --------------------------------------------------------------------- hero */

/**
 * Homepage hero.
 *
 * No product screenshot, no customer logo, no metric. Every one of those is a
 * claim the portfolio register cannot substantiate. What remains is typography
 * and space — which is also the honest way to present a company whose identity
 * has not been designed yet.
 */
export function Hero({
  locale,
  title,
  lede,
  primary,
  secondary,
}: {
  locale: Locale;
  title: string;
  lede: string;
  primary: { label: string; path: string };
  secondary?: { label: string; path: string };
}) {
  return (
    <Section spacing="loose">
      <Container>
        <div className="max-w-3xl">
          <Reveal>
            <h1 className="text-display font-bold">{title}</h1>
          </Reveal>
          <Reveal index={1}>
            <p className="mt-6 max-w-prose text-body-lg text-text-muted">{lede}</p>
          </Reveal>
          <Reveal index={2}>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href={href(locale, primary.path)}>{primary.label}</ButtonLink>
              {secondary && (
                <ButtonLink href={href(locale, secondary.path)} variant="secondary">
                  {secondary.label}
                </ButtonLink>
              )}
            </div>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}

/* -------------------------------------------------------------- empty state */

/**
 * The designed empty state.
 *
 * Most sections of this site are legitimately empty — no press coverage, no
 * open roles, no approved solution copy. This block makes that read as a
 * deliberate state rather than a bug, which matters because the alternative is
 * inventing content to fill the space.
 */
export function EmptyState({ locale, note }: { locale: Locale; note?: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border-strong bg-surface p-10 text-center">
      <h2 className="text-h4 font-semibold">{t(ui.emptyTitle, locale)}</h2>
      <p className="mx-auto mt-2 max-w-prose text-body-sm text-text-muted">
        {note ?? t(ui.emptyBody, locale)}
      </p>
    </div>
  );
}

/* ----------------------------------------------------------------- card grid */

/** Lists of content. Staggered reveal, capped so the stagger stays short. */
export function ContentGrid({
  children,
  columns = 3,
}: {
  children: ReactNode[];
  columns?: 2 | 3 | 4;
}) {
  return (
    <Grid columns={columns}>
      {children.map((child, i) => (
        // Stagger only the first row; beyond that the delay outlasts the scroll.
        <Reveal key={i} index={Math.min(i, columns)}>
          {child}
        </Reveal>
      ))}
    </Grid>
  );
}

/* -------------------------------------------------------------- breadcrumbs */

export function Breadcrumbs({
  locale,
  trail,
}: {
  locale: Locale;
  trail: Array<{ name: string; path: string }>;
}) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-2 text-caption text-text-muted">
        {trail.map((crumb, i) => (
          <li key={crumb.path} className="flex items-center gap-2">
            {i > 0 && <span aria-hidden="true">/</span>}
            {i === trail.length - 1 ? (
              <span aria-current="page">{crumb.name}</span>
            ) : (
              <Link
                href={href(locale, crumb.path)}
                className="text-text-muted no-underline hover:text-text"
              >
                {crumb.name}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/* ---------------------------------------------------------------------- CTA */

export function CTASection({
  locale,
  title,
  body,
  action,
}: {
  locale: Locale;
  title: string;
  body: string;
  action: { label: string; path: string };
}) {
  return (
    <Section tone="surface">
      <Container>
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <h2 className="text-h2 font-semibold">{title}</h2>
            <p className="mt-2 max-w-prose text-body text-text-muted">{body}</p>
          </div>
          <ButtonLink href={href(locale, action.path)}>{action.label}</ButtonLink>
        </div>
      </Container>
    </Section>
  );
}
