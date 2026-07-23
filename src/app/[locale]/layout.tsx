import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import '@/styles/globals.css';

import { brand } from '@brand/index';
import { primaryNav } from '@/content/navigation';
import type { Locale } from '@/content/types';
import { dirOf, isLocale, locales, t, ui } from '@/lib/i18n';
import { buildTokenStylesheet } from '@/lib/tokens';
import { organizationSchema, pageMetadata } from '@/lib/seo';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PlaceholderRibbon } from '@/components/blocks';
import { themeScript } from '@/components/ui/ThemeToggle';

/**
 * Root layout.
 *
 * This is the only place that knows about `<html>`, direction, and the token
 * stylesheet. `dir` is derived from the locale, so adding a third language is a
 * data change — no layout in the site hardcodes left or right (all spacing uses
 * CSS logical properties: `ps-`, `me-`, `start-`, `end-`).
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

  return {
    ...pageMetadata({
      locale,
      path: '/',
      title: t(brand.workingName, locale),
      description: t(
        {
          ar: 'الموقع الرسمي — قيد الإنشاء بهوية مؤقتة قابلة للاستبدال.',
          en: 'Official website — under construction with a swappable placeholder identity.',
        },
        locale,
      ),
    }),
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://example.invalid'),
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
      <body className="flex min-h-dvh flex-col">
        <a href="#main" className="skip-link">
          {t(ui.skipToContent, locale)}
        </a>

        <PlaceholderRibbon locale={locale} />
        <Header locale={locale} nav={primaryNav()} />

        <main id="main" className="flex-1">
          {children}
        </main>

        <Footer locale={locale} />
      </body>
    </html>
  );
}
