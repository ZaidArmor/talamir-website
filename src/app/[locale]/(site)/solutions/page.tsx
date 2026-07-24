import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getSolutions } from '@/content';
import { pageCopy } from '@/content/pages';
import { href, isLocale, t } from '@/lib/i18n';
import { pageMetadata } from '@/lib/seo';
import { CardLink } from '@/components/ui/primitives';
import { ContentGrid, EmptyState } from '@/components/blocks';
import { StaticPage } from '@/components/blocks/StaticPage';

const copy = pageCopy.solutions;
const PATH = '/solutions';

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

  // Drafts are withheld in production, so this list is legitimately empty there
  // and fully populated in development. Same code path, different visibility.
  const entries = getSolutions();

  return (
    <StaticPage
      locale={locale}
      copy={copy}
      trail={[
        { name: locale === 'ar' ? 'الرئيسية' : 'Home', path: '/' },
        { name: t(copy.title, locale), path: PATH },
      ]}
    >
      {entries.length === 0 ? (
        <EmptyState locale={locale} note={t(copy.pending, locale)} />
      ) : (
        <ContentGrid>
          {entries.map((entry) => (
            <CardLink
              key={entry.slug}
              href={href(locale, `${PATH}/${entry.slug}`)}
              title={t(entry.title, locale)}
              description={t(entry.summary, locale)}
            />
          ))}
        </ContentGrid>
      )}
    </StaticPage>
  );
}
