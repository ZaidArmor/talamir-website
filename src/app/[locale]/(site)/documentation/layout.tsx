import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getDocSections } from '@/content';
import { href, isLocale, t } from '@/lib/i18n';
import { Container, Section } from '@/components/ui/primitives';

/**
 * Documentation shell.
 *
 * Docs are the one area allowed a third navigation level, because reference
 * material is browsed rather than journeyed through. The sidebar is derived
 * from the doc registry's `section` and `order` fields, so a new page appears
 * in the right group by itself.
 *
 * On small screens the sidebar becomes a horizontally scrolling strip above the
 * content rather than a drawer — one fewer thing to open on a phone.
 */
export default async function DocsLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const sections = getDocSections();

  return (
    <Section spacing="tight">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[16rem_minmax(0,1fr)]">
          {sections.length > 0 && (
            <nav
              aria-label={locale === 'ar' ? 'تنقّل التوثيق' : 'Documentation navigation'}
              className="lg:sticky lg:top-24 lg:self-start"
            >
              {sections.map((group) => (
                <div key={group.section.en} className="mb-6">
                  <h2 className="mb-2 text-caption font-semibold uppercase text-text-muted">
                    {t(group.section, locale)}
                  </h2>
                  <ul className="flex flex-col gap-1">
                    {group.pages.map((page) => (
                      <li key={page.slug}>
                        <Link
                          href={href(locale, `/documentation/${page.slug}`)}
                          className="block rounded-md px-2 py-1.5 text-body-sm text-text-muted no-underline transition-colors duration-fast ease-standard hover:bg-surface-muted hover:text-text"
                        >
                          {t(page.title, locale)}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          )}

          <div className="min-w-0">{children}</div>
        </div>
      </Container>
    </Section>
  );
}
