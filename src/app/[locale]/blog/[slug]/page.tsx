import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPost, getPosts } from '@/content';
import { pageCopy } from '@/content/pages';
import { isLocale, locales, t, ui } from '@/lib/i18n';
import { pageMetadata } from '@/lib/seo';
import { renderMarkdown } from '@/lib/markdown';
import { Container, Prose, Section } from '@/components/ui/primitives';
import { Breadcrumbs, PageHeader } from '@/components/blocks';

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.flatMap((locale) => getPosts().map((post) => ({ locale, slug: post.slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = getPost(slug);
  if (!isLocale(locale) || !post) return {};
  return pageMetadata({
    locale,
    path: `/blog/${post.slug}`,
    title: post.title,
    description: post.summary,
  });
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();

  const post = getPost(slug);
  if (!post) notFound();

  return (
    <>
      <Section spacing="tight">
        <Container width="prose">
          <Breadcrumbs
            locale={locale}
            trail={[
              { name: locale === 'ar' ? 'الرئيسية' : 'Home', path: '/' },
              { name: t(pageCopy.blog.title, locale), path: '/blog' },
              { name: t(post.title, locale), path: `/blog/${post.slug}` },
            ]}
          />
        </Container>
      </Section>

      <PageHeader
        eyebrow={t(post.author, locale)}
        title={t(post.title, locale)}
        lede={t(post.summary, locale)}
      />

      <Section spacing="tight">
        <Container width="prose">
          <p className="mb-8 text-caption text-text-muted">
            {t(ui.lastUpdated, locale)}: <span className="force-ltr">{post.updated}</span>
          </p>
          <Prose>{renderMarkdown(t(post.body, locale))}</Prose>
        </Container>
      </Section>
    </>
  );
}
