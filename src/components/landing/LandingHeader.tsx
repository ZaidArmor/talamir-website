'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import type { LandingCopy } from '@/content/landing';
import type { Locale } from '@/content/types';
import { Mark } from './Mark';

/**
 * The landing header.
 *
 * Client, because three things here are genuinely stateful: the scrolled
 * border, the reading-progress bar, and the mobile drawer. Everything it
 * renders is passed in as plain data, so the copy stays server-owned.
 *
 * The language control is a pair of real links to the other locale's URL, not
 * a toggle writing to `localStorage`. That is the substantive change from the
 * approved design's behaviour and it is deliberate: the site's locale lives in
 * the path, so switching language must be a navigation. It also means the
 * control works with JavaScript disabled and can be opened in a new tab.
 */
export function LandingHeader({
  locale,
  copy,
  otherLocaleHref,
}: {
  locale: Locale;
  copy: LandingCopy;
  otherLocaleHref: string;
}) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const burgerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const scrollable = el.scrollHeight - el.clientHeight;
      setScrolled(el.scrollTop > 8);
      setProgress(scrollable > 0 ? (el.scrollTop / scrollable) * 100 : 0);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Escape closes the drawer and returns focus to the control that opened it.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        burgerRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);

  const sections: Array<[string, string]> = [
    ['#ecosystem', copy.nav.ecosystem],
    ['#buy', copy.nav.buy],
    ['#sell', copy.nav.sell],
    ['#fit', copy.nav.fit],
    ['#activity', copy.nav.activity],
    ['#faq', copy.nav.faq],
  ];

  return (
    <header className="lp-header" data-scrolled={scrolled}>
      <div className="lp-progress" style={{ width: `${progress}%` }} aria-hidden="true" />
      <div className="lp-wrap lp-header-inner">
        <a href="#hero" className="lp-brand" aria-label={copy.nav.homeLabel}>
          <span className="lp-brand-mark">
            <Mark size={34} />
          </span>
          <span className="lp-brand-word lp-ltr">TALAMIR</span>
        </a>

        <nav
          className="lp-nav"
          aria-label={copy.nav.primaryLabel}
          data-open={open}
          id="lp-primary-nav"
        >
          {sections.map(([anchor, label]) => (
            <a key={anchor} href={anchor} onClick={() => setOpen(false)}>
              {label}
            </a>
          ))}
        </nav>

        <div className="lp-header-actions">
          <div className="lp-lang" role="group" aria-label={copy.nav.languageLabel}>
            <span aria-current="true" lang={locale} className="lp-ltr">
              {locale === 'ar' ? 'عربي' : 'EN'}
            </span>
            <Link
              href={otherLocaleHref}
              hrefLang={locale === 'ar' ? 'en' : 'ar'}
              lang={locale === 'ar' ? 'en' : 'ar'}
            >
              {locale === 'ar' ? 'EN' : 'عربي'}
            </Link>
          </div>

          <a href="#contact" className="lp-btn lp-btn-primary lp-btn-sm">
            {copy.nav.cta}
          </a>

          <button
            ref={burgerRef}
            type="button"
            className="lp-burger"
            aria-label={open ? copy.nav.closeMenu : copy.nav.openMenu}
            aria-expanded={open}
            aria-controls="lp-primary-nav"
            onClick={() => setOpen((value) => !value)}
          >
            <span />
            <span />
          </button>
        </div>
      </div>
    </header>
  );
}
