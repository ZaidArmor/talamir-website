import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import '@/styles/globals.css';
import '@/styles/landing.css';

import { brand } from '@brand/index';
import { landingCopy } from '@/content/landing';
import type { Locale } from '@/content/types';
import { dirOf, isLocale, locales } from '@/lib/i18n';
import { buildTokenStylesheet } from '@/lib/tokens';
import { organizationSchema, pageMetadata, siteUrl } from '@/lib/seo';
import { themeScript } from '@/components/ui/ThemeToggle';

/**
 * Root layout.
 *
 * The only place that knows about `<html>`, direction and the token stylesheet.
 * `dir` is derived from the locale, so adding a third language is a data change
 * — no layout hardcodes left or right (all spacing uses CSS logical properties:
 * `ps-`, `me-`, `start-`, `end-`).
 *
 * Deliberately thin. The header, footer and skip link live in the `(site)`
 * layout, because the approved landing page brings its own chrome and would
 * otherwise render a second header and a second footer.
 */

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  const copy = landingCopy(locale);

  return {
    ...pageMetadata({
      locale,
      path: '/',
      title: copy.meta.title,
      description: copy.meta.description,
    }),
    // The template applies to pages *under* the root; the landing page sets its
    // own title outright, so it is not suffixed with the brand name twice.
    title: { default: copy.meta.title, template: `%s — ${brand.workingName[locale]}` },
    applicationName: brand.workingName[locale],
    metadataBase: new URL(siteUrl),
    icons: { icon: '/icon.svg', apple: '/apple-icon.png' },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale: Locale = raw;

  const schema = organizationSchema(locale);

  return (
    <html lang={locale} dir={dirOf(locale)} suppressHydrationWarning>
      <head>
        {/* Tokens are emitted, not authored — see src/lib/tokens.ts. */}
        <style dangerouslySetInnerHTML={{ __html: buildTokenStylesheet() }} />
        {/* Applies the stored theme before first paint to avoid a flash. */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        {schema && (
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: schema }} />
        )}
      </head>
      <body>{children}</body>
    </html>
  );
}
