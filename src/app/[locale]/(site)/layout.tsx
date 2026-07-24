import { notFound } from 'next/navigation';

import { primaryNav } from '@/content/navigation';
import type { Locale } from '@/content/types';
import { isLocale, t, ui } from '@/lib/i18n';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PlaceholderRibbon } from '@/components/blocks';

/**
 * The inner-site shell.
 *
 * Everything under `/{locale}/…` gets the standard header, footer and skip
 * link. The landing page at `/{locale}` deliberately does not: the approved
 * design carries its own chrome — a different header, a different footer, and
 * navigation that is entirely in-page — and wrapping it in the site shell would
 * produce two headers and two footers on the same document.
 *
 * A route group is the right tool for that: `(site)` changes which layout
 * applies without appearing in a single URL.
 */
export default async function SiteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale: Locale = raw;

  return (
    <div className="flex min-h-dvh flex-col">
      <a href="#main" className="skip-link">
        {t(ui.skipToContent, locale)}
      </a>

      <PlaceholderRibbon locale={locale} />
      <Header locale={locale} nav={primaryNav()} />

      <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
        {children}
      </main>

      <Footer locale={locale} />
    </div>
  );
}
