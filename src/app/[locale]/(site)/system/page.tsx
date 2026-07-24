import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { brand } from '@brand/index';
import type { Locale } from '@/content/types';
import { isLocale, t } from '@/lib/i18n';
import { pageMetadata } from '@/lib/seo';
import {
  Badge,
  ButtonLink,
  Card,
  CardLink,
  Container,
  Grid,
  Prose,
  Section,
} from '@/components/ui/primitives';
import { Disclosure } from '@/components/ui/Disclosure';
import { Tabs } from '@/components/ui/Tabs';
import { EmptyState, PageHeader } from '@/components/blocks';

/**
 * The living component library.
 *
 * Not a static style guide — it renders the *real* components against the
 * *active* brand tokens. Switch `NEXT_PUBLIC_BRAND_ID` and this page changes
 * with the rest of the site, which makes it the fastest way to review a
 * candidate identity across every component at once.
 *
 * It is `noindex` like the rest of the site today, and should stay `noindex`
 * even after launch — it is an internal review surface, not a public page.
 */

const copy = {
  title: { ar: 'نظام التصميم', en: 'Design System' },
  lede: {
    ar: 'المكوّنات الحقيقية معروضة بالرموز النشطة. بدّل الهوية وستتغيّر هذه الصفحة كما يتغيّر الموقع.',
    en: 'The real components rendered against the active tokens. Swap the identity and this page changes exactly as the site does.',
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return pageMetadata({
    locale,
    path: '/system',
    title: copy.title,
    description: copy.lede,
    // Internal review surface — never indexed, even post-launch.
    noindex: true,
  });
}

export default async function SystemPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale: Locale = raw;
  const ar = locale === 'ar';

  const colorRoles = Object.keys(brand.colors.light);

  return (
    <>
      <PageHeader
        eyebrow={`${brand.id} · ${brand.status}`}
        title={t(copy.title, locale)}
        lede={t(copy.lede, locale)}
      />

      {/* ------------------------------------------------------ colour roles */}
      <Section spacing="tight">
        <Container>
          <h2 className="text-h2 font-semibold">{ar ? 'أدوار اللون' : 'Colour roles'}</h2>
          <p className="mt-2 max-w-prose text-body-sm text-text-muted">
            {ar
              ? 'المكوّنات تستدعي الدور لا القيمة. لذلك يكفي استبدال ملف واحد لتغيير الموقع بأكمله.'
              : 'Components reference the role, never the value. That is why replacing one file changes the entire site.'}
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {colorRoles.map((role) => (
              <div key={role} className="rounded-md border border-border p-3">
                <div
                  className="h-12 w-full rounded-sm border border-border"
                  // The one legitimate dynamic style in the site: this swatch's
                  // job is to display the token, so it must read it by name.
                  style={{
                    background: `var(--color-${role.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)})`,
                  }}
                />
                <p className="force-ltr mt-2 font-mono text-caption text-text-muted">{role}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* ---------------------------------------------------------- typography */}
      <Section tone="surface" spacing="tight">
        <Container>
          <h2 className="text-h2 font-semibold">{ar ? 'المقياس الطباعي' : 'Type scale'}</h2>
          <div className="mt-6 flex flex-col gap-4">
            <p className="text-display font-bold">{ar ? 'عنوان عريض' : 'Display'}</p>
            <p className="text-h1 font-bold">{ar ? 'عنوان أول' : 'Heading 1'}</p>
            <p className="text-h2 font-semibold">{ar ? 'عنوان ثانٍ' : 'Heading 2'}</p>
            <p className="text-h3 font-semibold">{ar ? 'عنوان ثالث' : 'Heading 3'}</p>
            <p className="text-body-lg">{ar ? 'نص كبير' : 'Body large'}</p>
            <p className="text-body">{ar ? 'نص أساسي' : 'Body'}</p>
            <p className="text-body-sm text-text-muted">{ar ? 'نص صغير' : 'Body small'}</p>
            <p className="text-caption text-text-muted">{ar ? 'تعليق' : 'Caption'}</p>
          </div>
        </Container>
      </Section>

      {/* -------------------------------------------------------------- actions */}
      <Section spacing="tight">
        <Container>
          <h2 className="text-h2 font-semibold">
            {ar ? 'الأزرار والشارات' : 'Actions and badges'}
          </h2>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <ButtonLink href="#">{ar ? 'إجراء أساسي' : 'Primary'}</ButtonLink>
            <ButtonLink href="#" variant="secondary">
              {ar ? 'إجراء ثانوي' : 'Secondary'}
            </ButtonLink>
            <ButtonLink href="#" variant="ghost">
              {ar ? 'إجراء خفيف' : 'Ghost'}
            </ButtonLink>
            <Badge>{ar ? 'حيادي' : 'Neutral'}</Badge>
            <Badge tone="accent">{ar ? 'مميّز' : 'Accent'}</Badge>
            <Badge tone="warning">{ar ? 'تحذير' : 'Warning'}</Badge>
          </div>
        </Container>
      </Section>

      {/* --------------------------------------------------------- containers */}
      <Section tone="surface" spacing="tight">
        <Container>
          <h2 className="text-h2 font-semibold">{ar ? 'الحاويات' : 'Containers'}</h2>
          <div className="mt-6">
            <Grid columns={3}>
              <CardLink
                href="#"
                headingLevel={3}
                title={ar ? 'بطاقة رابط' : 'Card link'}
                meta={ar ? 'بيانات وصفية' : 'Meta'}
                description={
                  ar
                    ? 'السطح بالكامل قابل للنقر، لكن الاسم المقروء آلياً هو العنوان وحده.'
                    : 'The whole surface is clickable, but the accessible name is the heading alone.'
                }
              />
              <Card>
                <h3 className="text-h4 font-semibold">{ar ? 'بطاقة ساكنة' : 'Static card'}</h3>
                <p className="mt-2 text-body-sm text-text-muted">
                  {ar ? 'بلا سلوك تفاعلي.' : 'No interactive behaviour.'}
                </p>
              </Card>
              <div className="sm:col-span-2 lg:col-span-1">
                <EmptyState locale={locale} />
              </div>
            </Grid>
          </div>
        </Container>
      </Section>

      {/* -------------------------------------------------------- interactive */}
      <Section spacing="tight">
        <Container>
          <h2 className="text-h2 font-semibold">
            {ar ? 'المكوّنات التفاعلية' : 'Interactive components'}
          </h2>
          <p className="mt-2 max-w-prose text-body-sm text-text-muted">
            {ar
              ? 'جرّبها بلوحة المفاتيح: الأسهم تنقلك بين التبويبات وتنعكس في الاتجاه من اليمين لليسار.'
              : 'Try them by keyboard: arrow keys move between tabs, and their direction flips in RTL.'}
          </p>

          <div className="mt-6">
            <Tabs
              label={ar ? 'عرض المكوّنات' : 'Component demo'}
              items={[
                {
                  id: 'motion',
                  label: ar ? 'الحركة' : 'Motion',
                  content: (
                    <Prose>
                      <p>
                        {ar
                          ? 'كل حركة في الموقع انتقال CSS أو ظهور عند التمرير، ولا شيء يتجاوز تفضيل تقليل الحركة.'
                          : 'Every animation is a CSS transition or a scroll reveal, and nothing escapes the reduced-motion preference.'}
                      </p>
                      <ul>
                        <li>
                          {ar ? 'الفوري' : 'Instant'}: <code>{brand.motion.duration.instant}</code>
                        </li>
                        <li>
                          {ar ? 'السريع' : 'Fast'}: <code>{brand.motion.duration.fast}</code>
                        </li>
                        <li>
                          {ar ? 'الأساسي' : 'Base'}: <code>{brand.motion.duration.base}</code>
                        </li>
                        <li>
                          {ar ? 'البطيء' : 'Slow'}: <code>{brand.motion.duration.slow}</code>
                        </li>
                      </ul>
                    </Prose>
                  ),
                },
                {
                  id: 'disclosure',
                  label: ar ? 'الإفصاح' : 'Disclosure',
                  content: (
                    <div>
                      <Disclosure
                        question={
                          ar
                            ? 'هل تتغيّر هذه المكوّنات عند استبدال الهوية؟'
                            : 'Do these components change when the identity is swapped?'
                        }
                        defaultOpen
                      >
                        {ar
                          ? 'نعم — بالكامل. لا يحتوي أي مكوّن على لون أو زاوية أو زمن مكتوب مباشرة.'
                          : 'Yes — entirely. No component contains a literal colour, radius or timing.'}
                      </Disclosure>
                      <Disclosure
                        question={
                          ar ? 'كيف تُضاف صفحة منتج جديد؟' : 'How is a new product page added?'
                        }
                      >
                        {ar
                          ? 'بإضافة مُدخل واحد إلى سجل المنتجات. المسار والتنقّل وخريطة الموقع تُشتق تلقائياً.'
                          : 'One entry in the product registry. The route, navigation and sitemap all follow automatically.'}
                      </Disclosure>
                    </div>
                  ),
                },
                {
                  id: 'shape',
                  label: ar ? 'الشكل' : 'Shape',
                  content: (
                    <div className="flex flex-wrap gap-4">
                      {(['sm', 'md', 'lg', 'xl'] as const).map((size) => (
                        <div key={size} className="text-center">
                          <div
                            className="h-20 w-20 border border-border-strong bg-surface-muted"
                            style={{ borderRadius: `var(--radius-${size})` }}
                          />
                          <p className="force-ltr mt-2 font-mono text-caption text-text-muted">
                            {size}
                          </p>
                        </div>
                      ))}
                    </div>
                  ),
                },
              ]}
            />
          </div>
        </Container>
      </Section>
    </>
  );
}
