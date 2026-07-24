import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getIndustries, getIndustry } from '@/content';
import { pageCopy } from '@/content/pages';
import { isLocale, locales, t } from '@/lib/i18n';
import { pageMetadata } from '@/lib/seo';
import { Container, Prose, Section } from '@/components/ui/primitives';
import { Breadcrumbs, EmptyState, PageHeader } from '@/components/blocks';

/** One route for every entry — adding one is a content change, not a code change. */
export const dynamicParams = false;

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    getIndustries().map((entry) => ({ locale, slug: entry.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const entry = getIndustry(slug);
  if (!isLocale(locale) || !entry) return {};
  return pageMetadata({
    locale,
    path: `/industries/${entry.slug}`,
    title: entry.title,
    description: entry.summary,
  });
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();

  const entry = getIndustry(slug);
  if (!entry) notFound();

  const sections = entry.pressures;

  return (
    <>
      <Section spacing="tight">
        <Container>
          <Breadcrumbs
            locale={locale}
            trail={[
              { name: locale === 'ar' ? 'الرئيسية' : 'Home', path: '/' },
              { name: t(pageCopy.industries.title, locale), path: '/industries' },
              { name: t(entry.title, locale), path: `/industries/${entry.slug}` },
            ]}
          />
        </Container>
      </Section>

      <PageHeader title={t(entry.title, locale)} lede={t(entry.summary, locale)} />

      <Section spacing="tight">
        <Container>
          {sections.length === 0 ? (
            <EmptyState locale={locale} note={t(pageCopy.industries.pending, locale)} />
          ) : (
            <Prose>
              {sections.map((section) => (
                <div key={section.title.en}>
                  <h2>{t(section.title, locale)}</h2>
                  <p>{t(section.body, locale)}</p>
                </div>
              ))}
            </Prose>
          )}
        </Container>
      </Section>
    </>
  );
}
