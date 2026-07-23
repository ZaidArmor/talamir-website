import Link from 'next/link';
import { brand } from '@brand/index';
import { footerNav } from '@/content/navigation';
import type { Locale } from '@/content/types';
import { href, t, ui } from '@/lib/i18n';
import { Mark } from '@/components/brand/Mark';
import { Container } from '@/components/ui/primitives';

export function Footer({ locale }: { locale: Locale }) {
  const sections = footerNav();
  const name = t(brand.workingName, locale);

  return (
    <footer className="border-t border-border bg-surface">
      <Container className="py-14">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          <div className="col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 text-text">
              <Mark size={24} />
              <span className="text-body font-semibold">{name}</span>
            </div>
          </div>

          <nav aria-label={t(ui.footerNav, locale)} className="contents">
            {sections.map((section) => (
              <div key={section.path}>
                <h2 className="text-body-sm font-semibold text-text">
                  <Link href={href(locale, section.path)} className="text-text no-underline">
                    {t(section.label, locale)}
                  </Link>
                </h2>
                {section.children.length > 0 && (
                  <ul className="mt-3 flex flex-col gap-2">
                    {section.children.map((child) => (
                      <li key={child.path}>
                        <Link
                          href={href(locale, child.path)}
                          className="text-body-sm text-text-muted no-underline transition-colors duration-fast ease-standard hover:text-text"
                        >
                          {t(child.label, locale)}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-12 border-t border-border pt-6 text-caption text-text-muted">
          {/*
            No copyright line, no legal entity, no registration number. Those are
            legal claims, and `talamir-legal-compliance` holds no approved source
            for any of them. An empty legal footer is honest; an invented one is
            a liability.
          */}
          <p>{t(brand.notice ?? { ar: '', en: '' }, locale)}</p>
        </div>
      </Container>
    </footer>
  );
}
