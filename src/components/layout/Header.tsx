'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import type { NavSection } from '@/content/navigation';
import type { Locale } from '@/content/types';
import { href, localeLabel, locales, t, ui } from '@/lib/i18n';
import { Wordmark } from '@/components/brand/Wordmark';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Container } from '@/components/ui/primitives';

/**
 * Site header.
 *
 * Desktop uses hover/focus-revealed panels; below `lg` it collapses to a single
 * disclosure drawer. Both render the *same* nav tree from
 * `content/navigation.ts` — there is no second mobile menu to fall out of sync.
 */
export function Header({ locale, nav }: { locale: Locale; nav: NavSection[] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  // Close the drawer on navigation. Without this the menu stays open over the
  // new page, which reads as a broken link.
  useEffect(() => setOpen(false), [pathname]);

  // While the drawer is open the page behind it must not scroll.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Escape closes the drawer and returns focus to the toggle, matching the
  // keyboard convention for dismissible overlays.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-border header-surface backdrop-blur">
      <Container>
        <div className="flex h-16 items-center justify-between gap-4">
          <Wordmark locale={locale} />

          {/* ------------------------------------------------ desktop nav */}
          <nav aria-label={t(ui.mainNav, locale)} className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {nav.map((section) => (
                <li key={section.path} className="group relative">
                  <Link
                    href={href(locale, section.path)}
                    className="inline-flex items-center rounded-md px-3 py-2 text-body-sm text-text no-underline transition-colors duration-fast ease-standard hover:bg-surface-muted"
                  >
                    {t(section.label, locale)}
                  </Link>

                  {section.children.length > 0 && (
                    // Shown on hover *and* focus-within, so keyboard users get
                    // the panel too. `invisible` rather than `hidden` keeps the
                    // links focusable-in-sequence and lets opacity transition.
                    <div className="invisible absolute top-full z-10 w-64 translate-y-1 opacity-0 transition-[opacity,transform] duration-fast ease-entrance group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 start-0">
                      <ul className="rounded-lg border border-border bg-surface p-2 shadow-lg">
                        {section.children.map((child) => (
                          <li key={child.path}>
                            <Link
                              href={href(locale, child.path)}
                              className="block rounded-md px-3 py-2 text-body-sm text-text no-underline transition-colors duration-fast ease-standard hover:bg-surface-muted"
                            >
                              {t(child.label, locale)}
                              {child.description && (
                                <span className="mt-0.5 block text-caption text-text-muted">
                                  {t(child.description, locale)}
                                </span>
                              )}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-1">
            <LocaleSwitcher locale={locale} pathname={pathname} />
            <ThemeToggle label={t(ui.toggleTheme, locale)} />

            <button
              ref={menuButtonRef}
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={t(open ? ui.closeMenu : ui.openMenu, locale)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md text-text transition-colors duration-fast ease-standard hover:bg-surface-muted lg:hidden"
            >
              <span aria-hidden="true">{open ? '✕' : '☰'}</span>
            </button>
          </div>
        </div>
      </Container>

      {/* -------------------------------------------------- mobile drawer */}
      {open && (
        <div
          id="mobile-nav"
          className="max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-border bg-canvas lg:hidden"
        >
          <Container className="py-4">
            <nav aria-label={t(ui.mainNav, locale)}>
              <ul className="flex flex-col gap-6">
                {nav.map((section) => (
                  <li key={section.path}>
                    <Link
                      href={href(locale, section.path)}
                      className="block py-1 text-body font-semibold text-text no-underline"
                    >
                      {t(section.label, locale)}
                    </Link>
                    {section.children.length > 0 && (
                      <ul className="mt-2 flex flex-col border-s border-border ps-4">
                        {section.children.map((child) => (
                          <li key={child.path}>
                            <Link
                              href={href(locale, child.path)}
                              className="block py-2 text-body-sm text-text-muted no-underline"
                            >
                              {t(child.label, locale)}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          </Container>
        </div>
      )}
    </header>
  );
}

/**
 * Language switch.
 *
 * Swaps the locale segment in place, so the visitor stays on the page they were
 * reading instead of being dropped on the homepage.
 */
function LocaleSwitcher({ locale, pathname }: { locale: Locale; pathname: string }) {
  const other = locales.find((l) => l !== locale) ?? locale;
  const rest = pathname.replace(new RegExp(`^/${locale}`), '') || '';

  return (
    <Link
      href={`/${other}${rest}`}
      hrefLang={other}
      lang={other}
      className="inline-flex h-9 items-center rounded-md px-3 text-body-sm text-text-muted no-underline transition-colors duration-fast ease-standard hover:bg-surface-muted hover:text-text"
    >
      {localeLabel[other]}
    </Link>
  );
}
