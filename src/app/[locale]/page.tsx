import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProducts } from '@/content';
import { pageCopy } from '@/content/pages';
import { primaryNav } from '@/content/navigation';
import { href, isLocale, t } from '@/lib/i18n';
import { pageMetadata } from '@/lib/seo';
import { CardLink, Container, Section } from '@/components/ui/primitives';
import { ContentGrid, CTASection, Hero } from '@/components/blocks';

const copy = pageCopy.home;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return pageMetadata({ locale, path: '/', title: copy.title, description: copy.lede });
}

/**
 * Homepage.
 *
 * Three sections, in the order the three arrival questions get asked:
 * what is this → what do you make → where do I go next. There is no
 * social-proof band, no metrics strip and no testimonial row, because each
 * would require a claim the portfolio register cannot substantiate.
 */
export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const products = getProducts();
  const sections = primaryNav();

  return (
    <>
      <Hero
        locale={locale}
        title={t(copy.title, locale)}
        lede={t(copy.lede, locale)}
        primary={{
          label: locale === 'ar' ? 'استعرض المنتجات' : 'Browse products',
          path: '/products',
        }}
        secondary={{ label: locale === 'ar' ? 'من نحن' : 'About', path: '/about' }}
      />

      <Section tone="surface">
        <Container>
          <h2 className="text-h2 font-semibold">{t(pageCopy.products.title, locale)}</h2>
          <p className="mt-2 max-w-prose text-body text-text-muted">
            {t(pageCopy.products.pending, locale)}
          </p>

          <div className="mt-8">
            <ContentGrid>
              {products.map((product) => (
                <CardLink
                  key={product.slug}
                  href={href(locale, `/products/${product.slug}`)}
                  title={t(product.title, locale)}
                  meta={t(product.category, locale)}
                  description={t(product.summary, locale)}
                  headingLevel={3}
                />
              ))}
            </ContentGrid>
          </div>
        </Container>
      </Section>

      {/* The whole IA, exposed on the homepage. On a site this early, showing
          the structure is more useful to a visitor than selling to them. */}
      <Section>
        <Container>
          <h2 className="text-h2 font-semibold">
            {locale === 'ar' ? 'أقسام الموقع' : 'Site sections'}
          </h2>
          <div className="mt-8">
            <ContentGrid columns={4}>
              {sections.map((section) => (
                <CardLink
                  key={section.path}
                  href={href(locale, section.path)}
                  title={t(section.label, locale)}
                  description={section.children.map((child) => t(child.label, locale)).join(' · ')}
                  headingLevel={3}
                />
              ))}
            </ContentGrid>
          </div>
        </Container>
      </Section>

      <CTASection
        locale={locale}
        title={locale === 'ar' ? 'الهوية قيد التصميم' : 'The identity is still being designed'}
        body={
          locale === 'ar'
            ? 'هذا البناء هيكلي بالكامل. عند اعتماد الهوية تُستبدل الرموز في ملف واحد ويأخذ الموقع شكله النهائي دون إعادة بناء.'
            : 'This build is entirely structural. On sign-off the tokens are replaced in one file and the site takes its final form with no rebuild.'
        }
        action={{
          label: locale === 'ar' ? 'كيف تعمل رموز التصميم' : 'How the tokens work',
          path: '/documentation/design-tokens',
        }}
      />
    </>
  );
}
