import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProducts } from '@/content';
import { pageCopy } from '@/content/pages';
import { href, isLocale, t } from '@/lib/i18n';
import { pageMetadata } from '@/lib/seo';
import { CardLink } from '@/components/ui/primitives';
import { ContentGrid, EmptyState } from '@/components/blocks';
import { StaticPage } from '@/components/blocks/StaticPage';

const copy = pageCopy.products;
const PATH = '/products';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return pageMetadata({ locale, path: PATH, title: copy.title, description: copy.lede });
}

export default async function ProductsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const products = getProducts();

  return (
    <StaticPage
      locale={locale}
      copy={copy}
      trail={[
        { name: locale === 'ar' ? 'الرئيسية' : 'Home', path: '/' },
        { name: t(copy.title, locale), path: PATH },
      ]}
    >
      {products.length === 0 ? (
        <EmptyState locale={locale} note={t(copy.pending, locale)} />
      ) : (
        <>
          {/* The governance note is part of the page, not a disclaimer bolted
              on — it is the reason the cards say so little. */}
          <p className="mb-8 max-w-prose text-body-sm text-text-muted">{t(copy.pending, locale)}</p>

          <ContentGrid>
            {products.map((product) => (
              <CardLink
                key={product.slug}
                href={href(locale, `${PATH}/${product.slug}`)}
                title={t(product.title, locale)}
                meta={t(product.category, locale)}
                description={t(product.summary, locale)}
              />
            ))}
          </ContentGrid>
        </>
      )}
    </StaticPage>
  );
}
