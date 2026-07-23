import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { footerNav } from '@/content/navigation';
import { pageCopy } from '@/content/pages';
import { href, isLocale, t } from '@/lib/i18n';
import { pageMetadata } from '@/lib/seo';
import { Container, Grid, Section } from '@/components/ui/primitives';
import { PageHeader } from '@/components/blocks';

const copy = pageCopy.sitemap;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return pageMetadata({ locale, path: '/sitemap', title: copy.title, description: copy.lede });
}

/**
 * The human sitemap.
 *
 * Rendered from the same `footerNav()` tree as the header, footer and XML
 * sitemap — so it cannot drift out of date, which is the usual fate of a
 * hand-maintained sitemap page.
 */
export default async function SitemapPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <>
      <PageHeader title={t(copy.title, locale)} lede={t(copy.lede, locale)} />
      <Section spacing="tight">
        <Container>
          <Grid columns={3}>
            {footerNav().map((section) => (
              <div key={section.path}>
                <h2 className="text-h4 font-semibold">
                  <Link href={href(locale, section.path)} className="text-text no-underline">
                    {t(section.label, locale)}
                  </Link>
                </h2>
                <ul className="mt-3 flex flex-col gap-2">
                  {section.children.map((child) => (
                    <li key={child.path}>
                      <Link
                        href={href(locale, child.path)}
                        className="text-body-sm text-text-muted no-underline hover:text-text"
                      >
                        {t(child.label, locale)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </Grid>
        </Container>
      </Section>
    </>
  );
}
