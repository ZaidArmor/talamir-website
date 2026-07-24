import type { Metadata } from 'next';
import { brand } from '@brand/index';
import type { Locale, Localized } from '@/content/types';
import { locales, t } from './i18n';
import { publicIndexingEnabled, structuredDataEnabled } from './visibility';

/**
 * SEO architecture.
 *
 * Three rules hold the whole system together:
 *   1. Every page declares a canonical URL and a full set of hreflang alternates.
 *   2. Titles and descriptions come from content, never from hardcoded strings.
 *   3. Indexing is off unless explicitly enabled — see src/lib/visibility.ts.
 *      The identity is approved, but the deployed design has not been verified
 *      in production, and a premature listing is slow to correct.
 */

/**
 * The production origin.
 *
 * Defaults to the real domain rather than a placeholder: canonicals, hreflang
 * and Open Graph URLs are wrong in a way nobody notices if they silently point
 * at an unreachable host, and the domain is now purchased and connected.
 */
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.talamir.org').replace(
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
      // The site-wide gate. Lifting it is a deliberate environment decision,
      // not something an individual page can opt into.
      !publicIndexingEnabled || noindex
        ? { index: false, follow: false, nocache: true }
        : { index: true, follow: true },
  };
}

/**
 * Organisation JSON-LD.
 *
 * Emitted only once public indexing is enabled. Structured data exists to be
 * read by crawlers; publishing it to crawlers that are simultaneously told not
 * to index the site would put the brand into knowledge graphs ahead of the
 * decision to be listed at all.
 *
 * Returns a @graph carrying both Organization and WebSite, so the site name and
 * its bilingual home are stated once, from the same tokens the pages render.
 */
export function organizationSchema(locale: Locale): string | null {
  if (!structuredDataEnabled) return null;

  const name = t(brand.workingName, locale);

  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${siteUrl}/#organization`,
        name,
        alternateName: locale === 'ar' ? brand.workingName.en : brand.workingName.ar,
        url: siteUrl,
        ...(brand.tagline ? { slogan: t(brand.tagline, locale) } : {}),
        ...(brand.logo.asset ? { logo: absolute(brand.logo.asset) } : {}),
      },
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        name,
        url: absolute(`/${locale}`),
        inLanguage: locale === 'ar' ? 'ar-SA' : 'en',
        publisher: { '@id': `${siteUrl}/#organization` },
      },
    ],
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
