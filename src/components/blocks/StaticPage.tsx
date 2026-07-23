import type { StaticPageCopy } from '@/content/pages';
import type { Locale } from '@/content/types';
import { t } from '@/lib/i18n';
import { Container, Prose, Section } from '@/components/ui/primitives';
import { Breadcrumbs, EmptyState, PageHeader } from './index';

/**
 * Renders a fixed page from its `StaticPageCopy` entry.
 *
 * Twelve routes share this component. That is deliberate: while the content is
 * pending, every one of those pages should look identical in structure, so a
 * reviewer sees the *system* rather than twelve half-finished designs. When a
 * page earns real content it stops using this and gets its own composition.
 */
export function StaticPage({
  locale,
  copy,
  trail,
  children,
}: {
  locale: Locale;
  copy: StaticPageCopy;
  trail: Array<{ name: string; path: string }>;
  /** Real content, when it exists. Replaces the empty state. */
  children?: React.ReactNode;
}) {
  return (
    <>
      <Section spacing="tight">
        <Container>
          <Breadcrumbs locale={locale} trail={trail} />
        </Container>
      </Section>

      <PageHeader title={t(copy.title, locale)} lede={t(copy.lede, locale)} />

      <Section spacing="tight">
        <Container>
          {children ?? <EmptyState locale={locale} note={t(copy.pending, locale)} />}

          {copy.sections && copy.sections.length > 0 && (
            <Prose className="mt-12">
              {copy.sections.map((section) => (
                <div key={section.heading.en}>
                  <h2>{t(section.heading, locale)}</h2>
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
