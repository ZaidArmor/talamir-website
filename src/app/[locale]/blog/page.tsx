import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPosts } from '@/content';
import { pageCopy } from '@/content/pages';
import { href, isLocale, t } from '@/lib/i18n';
import { pageMetadata } from '@/lib/seo';
import { CardLink } from '@/components/ui/primitives';
import { ContentGrid, EmptyState } from '@/components/blocks';
import { StaticPage } from '@/components/blocks/StaticPage';

const copy = pageCopy.blog;
const PATH = '/blog';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return pageMetadata({ locale, path: PATH, title: copy.title, description: copy.lede });
}

export default async function BlogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const posts = getPosts();

  return (
    <StaticPage
      locale={locale}
      copy={copy}
      trail={[
        { name: locale === 'ar' ? 'الرئيسية' : 'Home', path: '/' },
        { name: t(copy.title, locale), path: PATH },
      ]}
    >
      {posts.length === 0 ? (
        <EmptyState locale={locale} note={t(copy.pending, locale)} />
      ) : (
        <ContentGrid columns={2}>
          {posts.map((post) => (
            <CardLink
              key={post.slug}
              href={href(locale, `${PATH}/${post.slug}`)}
              title={t(post.title, locale)}
              meta={post.published}
              description={t(post.summary, locale)}
            />
          ))}
        </ContentGrid>
      )}
    </StaticPage>
  );
}
