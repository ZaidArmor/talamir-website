import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getRoles } from '@/content';
import { pageCopy } from '@/content/pages';
import { href, isLocale, t } from '@/lib/i18n';
import { pageMetadata } from '@/lib/seo';
import { CardLink } from '@/components/ui/primitives';
import { ContentGrid, EmptyState } from '@/components/blocks';
import { StaticPage } from '@/components/blocks/StaticPage';

const copy = pageCopy.careers;
const PATH = '/careers';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return pageMetadata({ locale, path: PATH, title: copy.title, description: copy.lede });
}

export default async function CareersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const roles = getRoles();

  return (
    <StaticPage
      locale={locale}
      copy={copy}
      trail={[
        { name: locale === 'ar' ? 'الرئيسية' : 'Home', path: '/' },
        { name: t(copy.title, locale), path: PATH },
      ]}
    >
      {roles.length === 0 ? (
        <EmptyState locale={locale} note={t(copy.pending, locale)} />
      ) : (
        <ContentGrid columns={2}>
          {roles.map((role) => (
            <CardLink
              key={role.slug}
              href={href(locale, `${PATH}/${role.slug}`)}
              title={t(role.title, locale)}
              meta={`${t(role.department, locale)} · ${t(role.location, locale)}`}
              description={t(role.summary, locale)}
            />
          ))}
        </ContentGrid>
      )}
    </StaticPage>
  );
}
