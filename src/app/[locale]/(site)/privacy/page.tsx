import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { pageCopy } from '@/content/pages';
import { isLocale, t } from '@/lib/i18n';
import { pageMetadata } from '@/lib/seo';
import { StaticPage } from '@/components/blocks/StaticPage';

/**
 * The privacy notice — an internal draft.
 *
 * It exists so the contact form's consent disclosure has something honest to
 * link to. It describes exactly how the intake handles data and nothing more,
 * and its own copy states plainly that it is a draft pending legal review. It
 * inherits the site-wide `noindex` and is additionally requested `noindex` here
 * so it cannot be indexed even if the site-wide gate is later lifted for other
 * pages.
 */
const copy = pageCopy.privacy;
const PATH = '/privacy';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return pageMetadata({
    locale,
    path: PATH,
    title: copy.title,
    description: copy.lede,
    noindex: true,
  });
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <StaticPage
      locale={locale}
      copy={copy}
      trail={[
        { name: locale === 'ar' ? 'الرئيسية' : 'Home', path: '/' },
        { name: t(copy.title, locale), path: PATH },
      ]}
    />
  );
}
