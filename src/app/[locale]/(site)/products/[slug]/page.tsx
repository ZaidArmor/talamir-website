import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProduct, getProducts } from '@/content';
import { isLocale, locales, t, ui } from '@/lib/i18n';
import { pageMetadata } from '@/lib/seo';
import { Badge, Container, Prose, Section } from '@/components/ui/primitives';
import { Breadcrumbs, CTASection, EmptyState, PageHeader } from '@/components/blocks';

/**
 * Product detail.
 *
 * One route serves every product, present and future. A new product needs an
 * entry in `content/products.ts` and nothing else — this page, the listing, the
 * navigation, the sitemap and the metadata all follow from it.
 */

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    getProducts().map((product) => ({ locale, slug: product.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = getProduct(slug);
  if (!isLocale(locale) || !product) return {};

  return pageMetadata({
    locale,
    path: `/products/${product.slug}`,
    title: t(product.title, locale),
    description: t(product.summary, locale),
  });
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();

  const product = getProduct(slug);
  if (!product) notFound();

  const home = locale === 'ar' ? 'الرئيسية' : 'Home';
  const productsLabel = locale === 'ar' ? 'المنتجات' : 'Products';

  return (
    <>
      <Section spacing="tight">
        <Container>
          <Breadcrumbs
            locale={locale}
            trail={[
              { name: home, path: '/' },
              { name: productsLabel, path: '/products' },
              { name: t(product.title, locale), path: `/products/${product.slug}` },
            ]}
          />
        </Container>
      </Section>

      <PageHeader
        eyebrow={t(product.category, locale)}
        title={t(product.title, locale)}
        lede={t(product.summary, locale)}
      >
        <dl className="flex flex-wrap items-center gap-x-8 gap-y-3">
          <div className="flex items-center gap-2">
            <dt className="text-caption text-text-muted">{t(ui.lifecycleStage, locale)}</dt>
            <dd>
              {/*
                The register says UNKNOWN for most fields. Rendering that plainly
                is the whole point — an invented stage here would contradict the
                portfolio register, which is the authoritative source.
              */}
              {product.lifecycleStage ? (
                <Badge tone="warning">{t(product.lifecycleStage, locale)}</Badge>
              ) : (
                <Badge>{t(ui.pendingOwnerInput, locale)}</Badge>
              )}
            </dd>
          </div>
          <div className="flex items-center gap-2">
            <dt className="text-caption text-text-muted">{t(ui.lastUpdated, locale)}</dt>
            <dd className="force-ltr text-caption text-text-muted">{product.updated}</dd>
          </div>
        </dl>
      </PageHeader>

      <Section spacing="tight">
        <Container>
          {product.capabilities.length === 0 ? (
            <EmptyState
              locale={locale}
              note={
                locale === 'ar'
                  ? 'لا توجد قدرات معتمدة للنشر لهذا المنتج. القسم مبني ويظهر تلقائياً عند إضافة المحتوى إلى سجل المنتجات.'
                  : 'No approved capabilities to publish for this product. The section is built and appears automatically once content is added to the product registry.'
              }
            />
          ) : (
            <Prose>
              {product.capabilities.map((capability) => (
                <div key={capability.title.en}>
                  <h2>{t(capability.title, locale)}</h2>
                  <p>{t(capability.body, locale)}</p>
                </div>
              ))}
            </Prose>
          )}
        </Container>
      </Section>

      <CTASection
        locale={locale}
        title={locale === 'ar' ? 'أسئلة حول هذا المنتج؟' : 'Questions about this product?'}
        body={
          locale === 'ar'
            ? 'قنوات التواصل الرسمية لم تُعتمد بعد — صفحة التواصل توضّح الحالة.'
            : 'Official contact channels are not yet approved — the contact page explains the current state.'
        }
        action={{ label: locale === 'ar' ? 'تواصل معنا' : 'Contact', path: '/contact' }}
      />
    </>
  );
}
