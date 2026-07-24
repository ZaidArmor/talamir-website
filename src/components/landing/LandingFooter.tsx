import Link from 'next/link';
import type { EcosystemEntity, LandingCopy } from '@/content/landing';
import type { Locale } from '@/content/types';
import { anchorFor } from './anchors';
import { Mark } from './Mark';

/**
 * The landing footer.
 *
 * Every destination here is an anchor on this page or the other locale of it.
 * That is a content decision, not a limitation: the deeper sections of the site
 * exist but hold no published content yet, and linking a visitor from a
 * finished homepage into an empty page is worse than not linking at all.
 */
export function LandingFooter({
  locale,
  copy,
  entities,
  otherLocaleHref,
}: {
  locale: Locale;
  copy: LandingCopy;
  entities: EcosystemEntity[];
  otherLocaleHref: string;
}) {
  return (
    <footer className="lp-footer">
      <div className="lp-wrap lp-footer-grid">
        <div>
          <a href="#hero" className="lp-brand" aria-label={copy.nav.homeLabel}>
            <span className="lp-brand-mark">
              <Mark size={32} />
            </span>
            <span className="lp-brand-word lp-ltr">TALAMIR</span>
          </a>
          <p className="lp-muted lp-foot-blurb">{copy.footer.blurb}</p>
        </div>

        <nav aria-label={copy.footer.navLabel}>
          <p className="lp-mono lp-foot-label">{copy.footer.navLabel}</p>
          <a href="#about">{copy.about.tag}</a>
          <a href="#buy">{copy.nav.buy}</a>
          <a href="#sell">{copy.nav.sell}</a>
          <a href="#faq">{copy.nav.faq}</a>
        </nav>

        <nav aria-label={copy.footer.ecosystemLabel}>
          <p className="lp-mono lp-foot-label">{copy.footer.ecosystemLabel}</p>
          {entities.map((entity) => (
            <a key={entity.id} href={`#${anchorFor(entity.id)}`} className="lp-ltr">
              {entity.nameEn}
            </a>
          ))}
        </nav>

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
      </div>

      <div className="lp-wrap lp-footer-bottom">
        <span>{copy.footer.rights}</span>
        <span className="lp-mono lp-ltr" dir="ltr">
          {copy.footer.signature}
        </span>
      </div>
    </footer>
  );
}
