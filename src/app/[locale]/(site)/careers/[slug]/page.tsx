import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getRole, getRoles } from '@/content';
import { pageCopy } from '@/content/pages';
import { isLocale, locales, t, ui } from '@/lib/i18n';
import { pageMetadata } from '@/lib/seo';
import { Badge, Container, Prose, Section } from '@/components/ui/primitives';
import { Breadcrumbs, PageHeader } from '@/components/blocks';

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.flatMap((locale) => getRoles().map((role) => ({ locale, slug: role.slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const role = getRole(slug);
  if (!isLocale(locale) || !role) return {};
  return pageMetadata({
    locale,
    path: `/careers/${role.slug}`,
    title: role.title,
    description: role.summary,
  });
}

export default async function RolePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();

  const role = getRole(slug);
  if (!role) notFound();

  return (
    <>
      <Section spacing="tight">
        <Container width="prose">
          <Breadcrumbs
            locale={locale}
            trail={[
              { name: locale === 'ar' ? 'الرئيسية' : 'Home', path: '/' },
              { name: t(pageCopy.careers.title, locale), path: '/careers' },
              { name: t(role.title, locale), path: `/careers/${role.slug}` },
            ]}
          />
        </Container>
      </Section>

      <PageHeader
        eyebrow={t(role.department, locale)}
        title={t(role.title, locale)}
        lede={t(role.summary, locale)}
      >
        <div className="flex flex-wrap gap-2">
          <Badge>{t(role.location, locale)}</Badge>
          {/* Employment type is optional: an undecided arrangement is shown as
              undecided rather than defaulted to "full-time". */}
          <Badge>
            {role.employmentType ? t(role.employmentType, locale) : t(ui.pendingOwnerInput, locale)}
          </Badge>
        </div>
      </PageHeader>

      <Section spacing="tight">
        <Container width="prose">
          <Prose>
            <h2>{locale === 'ar' ? 'المسؤوليات' : 'Responsibilities'}</h2>
            <ul>
              {role.responsibilities.map((item, i) => (
                <li key={i}>{t(item, locale)}</li>
              ))}
            </ul>
            <h2>{locale === 'ar' ? 'المتطلبات' : 'Requirements'}</h2>
            <ul>
              {role.requirements.map((item, i) => (
                <li key={i}>{t(item, locale)}</li>
              ))}
            </ul>
          </Prose>
        </Container>
      </Section>
    </>
  );
}
