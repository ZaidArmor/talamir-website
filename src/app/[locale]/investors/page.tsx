import type { Metadata } from 'next';
import { pageCopy } from '@/content/pages';
import { isLocale, t } from '@/lib/i18n';
import { pageMetadata } from '@/lib/seo';
import { StaticPage } from '@/components/blocks/StaticPage';
import { notFound } from 'next/navigation';

const copy = pageCopy.investors;
const PATH = '/investors';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return pageMetadata({ locale, path: PATH, title: copy.title, description: copy.lede });
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
