import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getDoc, getDocs } from '@/content';
import { isLocale, locales, t, ui } from '@/lib/i18n';
import { pageMetadata } from '@/lib/seo';
import { renderMarkdown } from '@/lib/markdown';
import { Prose } from '@/components/ui/primitives';
import { PageHeader } from '@/components/blocks';

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.flatMap((locale) => getDocs().map((doc) => ({ locale, slug: doc.slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const doc = getDoc(slug);
  if (!isLocale(locale) || !doc) return {};
  return pageMetadata({
    locale,
    path: `/documentation/${doc.slug}`,
    title: doc.title,
    description: doc.summary,
  });
}

export default async function DocPageRoute({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();

  const doc = getDoc(slug);
  if (!doc) notFound();

  return (
    <>
      <PageHeader
        eyebrow={t(doc.section, locale)}
        title={t(doc.title, locale)}
        lede={t(doc.summary, locale)}
      />
      <p className="mb-8 text-caption text-text-muted">
        {t(ui.lastUpdated, locale)}: <span className="force-ltr">{doc.updated}</span>
      </p>
      <Prose>{renderMarkdown(t(doc.body, locale))}</Prose>
    </>
  );
}
