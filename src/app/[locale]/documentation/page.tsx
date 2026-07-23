import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getDocs } from '@/content';
import { pageCopy } from '@/content/pages';
import { href, isLocale, t } from '@/lib/i18n';
import { pageMetadata } from '@/lib/seo';
import { CardLink } from '@/components/ui/primitives';
import { ContentGrid, EmptyState, PageHeader } from '@/components/blocks';

const copy = pageCopy.documentation;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return pageMetadata({
    locale,
    path: '/documentation',
    title: copy.title,
    description: copy.lede,
  });
}

export default async function DocsIndex({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const docs = getDocs();

  return (
    <>
      <PageHeader title={t(copy.title, locale)} lede={t(copy.lede, locale)} />
      {docs.length === 0 ? (
        <EmptyState locale={locale} note={t(copy.pending, locale)} />
      ) : (
        <ContentGrid columns={2}>
          {docs.map((doc) => (
            <CardLink
              key={doc.slug}
              href={href(locale, `/documentation/${doc.slug}`)}
              title={t(doc.title, locale)}
              meta={t(doc.section, locale)}
              description={t(doc.summary, locale)}
            />
          ))}
        </ContentGrid>
      )}
    </>
  );
}
