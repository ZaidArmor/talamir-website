import { notFound } from 'next/navigation';
import { isLocale } from '@/lib/i18n';
import { LandingPage } from '@/components/landing/LandingPage';

/**
 * The public landing page, at `/ar` and `/en`.
 *
 * The whole composition lives in `components/landing/LandingPage`, which is a
 * server component; this file exists only to validate the locale segment. The
 * page's metadata comes from the root layout, because the landing page *is* the
 * site root and its title and description are the site's own.
 */
export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return <LandingPage locale={locale} />;
}
