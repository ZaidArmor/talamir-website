import type { Metadata } from 'next';
import { brand, isPlaceholderIdentity } from '@brand/index';
import type { Locale, Localized } from '@/content/types';
import { locales, t } from './i18n';

/**
 * SEO architecture.
 *
 * Three rules hold the whole system together:
 *   1. Every page declares a canonical URL and a full set of hreflang alternates.
 *   2. Titles and descriptions come from content, never from hardcoded strings.
 *   3. While the identity is unapproved the entire site is `noindex` — an
 *      unnamed, unbranded site must not accumulate search history under a name
 *      that has not been validated.
 */

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://example.invalid').replace(
  /\/$/,
  '',
);

const absolute = (path: string): string => `${siteUrl}${path}`;

interface PageSeoInput {
  locale: Locale;
  /** Locale-agnostic path, e.g. `/products/vexora`. */
  path: string;
  title: Localized | string;
  description: Localized | string;
  /** Overrides the site-wide indexing decision downward only, never upward. */
  noindex?: boolean;
}

const resolve = (value: Localized | string, locale: Locale): string =>
  typeof value === 'string' ? value : t(value, locale);

export function pageMetadata({
  locale,
  path,
  title,
  description,
  noindex,
}: PageSeoInput): Metadata {
  const name = t(brand.workingName, locale);
  const pageTitle = resolve(title, locale);
  const desc = resolve(description, locale);

  // hreflang for every locale plus x-default pointing at the primary locale.
  const languages: Record<string, string> = Object.fromEntries(
    locales.map((l) => [l, absolute(`/${l}${path === '/' ? '' : path}`)]),
  );
  languages['x-default'] = absolute(`/ar${path === '/' ? '' : path}`);

  const canonical = absolute(`/${locale}${path === '/' ? '' : path}`);

  return {
    title: pageTitle,
    description: desc,
    alternates: { canonical, languages },
    openGraph: {
      type: 'website',
      siteName: name,
      title: pageTitle,
      description: desc,
      url: canonical,
      locale: locale === 'ar' ? 'ar_SA' : 'en_US',
    },
    twitter: { card: 'summary_large_image', title: pageTitle, description: desc },
    robots:
      // The site-wide gate. Lifting it is a deliberate act tied to identity
      // sign-off, not something an individual page can opt out of.
      isPlaceholderIdentity || noindex
        ? { index: false, follow: false, nocache: true }
        : { index: true, follow: true },
  };
}

/**
 * Organisation JSON-LD.
 *
 * Emitted only once the identity is approved. Publishing structured data under
 * an unvalidated name would put that name into knowledge graphs, which is
 * exactly the outcome the name-validation hold exists to prevent.
 */
export function organizationSchema(locale: Locale): string | null {
  if (isPlaceholderIdentity) return null;

  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: t(brand.workingName, locale),
    url: siteUrl,
    ...(brand.logo.asset ? { logo: absolute(brand.logo.asset) } : {}),
  });
}

/** Breadcrumb JSON-LD. Safe under placeholder — it names paths, not the brand. */
export function breadcrumbSchema(
  locale: Locale,
  trail: Array<{ name: string; path: string }>,
): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((crumb, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: crumb.name,
      item: absolute(`/${locale}${crumb.path === '/' ? '' : crumb.path}`),
    })),
  });
}
