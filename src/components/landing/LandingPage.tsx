import { landingCopy, orderedEcosystem } from '@/content/landing';
import type { Locale } from '@/content/types';
import { href } from '@/lib/i18n';

import { ContactForm } from './ContactForm';
import { EcosystemMap } from './EcosystemMap';
import { FitFinder } from './FitFinder';
import { BuildIcon, ChapterArc, SultanArc } from './Icons';
import { LandingFooter } from './LandingFooter';
import { LandingHeader } from './LandingHeader';
import { MarketFlow } from './MarketFlow';
import { Mark, SpinningMark } from './Mark';
import { Orbit } from './Orbit';
import { PathChooser } from './PathChooser';
import { Reveal } from './Reveal';
import { anchorFor } from './anchors';
import { SelectionProvider } from './SelectionContext';
import { StatusBadge } from './StatusBadge';

/**
 * The approved TALAMIR landing page.
 *
 * A server component. Only five things on the page are interactive — the
 * header, the path chooser, the ecosystem map, the marketplace flow, the fit
 * finder and the enquiry form — and each is its own client island. Everything
 * else, which is most of the page by weight, ships as HTML with no JavaScript
 * attached to it.
 *
 * The section order is the approved design's, and the numbering in the comments
 * matches the design file so the two can be diffed by eye.
 */
export function LandingPage({ locale }: { locale: Locale }) {
  const copy = landingCopy(locale);
  const entities = orderedEcosystem();
  const sultan = entities.find((entity) => entity.id === 'sultan');
  const chapters = entities.filter((entity) => entity.id !== 'sultan');
  const otherLocale: Locale = locale === 'ar' ? 'en' : 'ar';

  return (
    // The approved design is a dark composition; the scope pins the colour
    // roles to the dark scheme for this subtree only. See src/lib/tokens.ts.
    <div className="lp" data-scheme="dark">
      {/* 01 — preloader. CSS-only; retires itself without JavaScript. */}
      <div className="lp-preloader" aria-hidden="true">
        <SpinningMark size={72} />
        <p className="lp-mono">{copy.preloader.line}</p>
      </div>

      <a href="#main" className="skip-link">
        {copy.nav.skip}
      </a>

      <LandingHeader locale={locale} copy={copy} otherLocaleHref={href(otherLocale, '/')} />

      <SelectionProvider initial={entities[0]?.id ?? 'sultan'}>
        <main id="main" tabIndex={-1}>
          {/* 02 — hero */}
          <section id="hero" className="lp-hero lp-wrap">
            <div>
              <Reveal as="p" className="lp-pill" index={0}>
                <span className="lp-pill-dot" aria-hidden="true" />
                <span>{copy.hero.kicker}</span>
              </Reveal>
              <Reveal as="h1" className="lp-hero-title" index={1}>
                {copy.hero.title}
              </Reveal>
              <Reveal as="p" className="lp-hero-alt" index={2}>
                <span lang={otherLocale} dir={otherLocale === 'ar' ? 'rtl' : 'ltr'}>
                  {copy.hero.alt}
                </span>
              </Reveal>
              <Reveal as="p" className="lp-hero-sub" index={3}>
                {copy.hero.sub}
              </Reveal>
              <Reveal className="lp-hero-cta" index={4}>
                <a href="#fit" className="lp-btn lp-btn-primary">
                  {copy.hero.primaryCta}
                </a>
                <a href="#ecosystem" className="lp-btn lp-btn-ghost">
                  {copy.hero.secondaryCta}
                </a>
              </Reveal>
            </div>

            <div className="lp-hero-visual" aria-hidden="true">
              <Orbit />
            </div>
          </section>

          {/* 03 — choose your path */}
          <section id="paths" className="lp-band">
            <div className="lp-wrap">
              <Reveal as="h2" className="lp-title">
                {copy.paths.title}
              </Reveal>
              <Reveal as="p" className="lp-lede" index={1}>
                {copy.paths.sub}
              </Reveal>
              <PathChooser copy={copy} entities={entities} />
            </div>
          </section>

          {/* 04 — about · 05 — what we build */}
          <section id="about" className="lp-wrap lp-section">
            <Reveal as="p" className="lp-tag">
              {copy.about.tag}
            </Reveal>
            <Reveal as="h2" className="lp-title" index={1}>
              {copy.about.title}
            </Reveal>
            <div className="lp-grid-3">
              {copy.about.paragraphs.map((paragraph, index) => (
                <Reveal key={paragraph} as="p" className="lp-lede" index={index}>
                  {paragraph}
                </Reveal>
              ))}
            </div>

            <Reveal className="lp-section-head">
              <h2 className="lp-title">{copy.builds.title}</h2>
            </Reveal>
            <div className="lp-cards-4">
              {copy.builds.items.map((item, index) => (
                <Reveal key={item.title} as="article" className="lp-card" index={index}>
                  <BuildIcon index={index} />
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </Reveal>
              ))}
            </div>
          </section>

          {/* 06 — interactive ecosystem */}
          <section id="ecosystem" className="lp-band">
            <div className="lp-wrap">
              <Reveal as="p" className="lp-tag lp-tag-teal">
                {copy.ecosystem.tag}
              </Reveal>
              <Reveal as="h2" className="lp-title" index={1}>
                {copy.ecosystem.title}
              </Reveal>
              <Reveal as="p" className="lp-lede" index={2}>
                {copy.ecosystem.sub}
              </Reveal>
              <EcosystemMap locale={locale} copy={copy} entities={entities} />
            </div>
          </section>

          {/* 07 — SULTAN deep dive */}
          {sultan && (
            <section id="sultan" className="lp-wrap lp-section">
              <Reveal as="p" className="lp-tag lp-tag-teal">
                {copy.sultan.tag}
              </Reveal>
              <Reveal className="lp-prod-hero" index={1}>
                <div>
                  <div className="lp-prod-name">
                    <span className="lp-p-en lp-ltr">{sultan.nameEn}</span>
                    <span className="lp-p-ar">{sultan.nameAr}</span>
                    <StatusBadge entity={sultan} locale={locale} />
                  </div>
                  <p className="lp-mono lp-teal lp-endorse">{sultan.endorsement[locale]}</p>
                  <h2 className="lp-title">{copy.sultan.title}</h2>
                  <p className="lp-lede">{sultan.description[locale]}</p>
                </div>
                <div className="lp-prod-visual" aria-hidden="true">
                  <SultanArc />
                </div>
              </Reveal>

              <Reveal as="h3" className="lp-h3" index={2}>
                {copy.sultan.experiencesTitle}
              </Reveal>
              <Reveal className="lp-chip-row" index={3}>
                {copy.sultan.experiences.map((experience) => (
                  <span key={experience} className="lp-chip">
                    {experience}
                  </span>
                ))}
              </Reveal>
              <Reveal as="p" className="lp-mono lp-note" index={4}>
                {copy.sultan.note}
              </Reveal>
            </section>
          )}

          {/* 08 — what you can buy */}
          <section id="buy" className="lp-band">
            <div className="lp-wrap">
              <Reveal as="p" className="lp-tag">
                {copy.buy.tag}
              </Reveal>
              <Reveal as="h2" className="lp-title" index={1}>
                {copy.buy.title}
              </Reveal>

              <div className="lp-grid-3">
                {copy.buy.columns.map((column, index) => (
                  <Reveal key={column.title} className="lp-card" index={index}>
                    <h3>{column.title}</h3>
                    <ul className="lp-bullets">
                      {column.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                    <a
                      href={index === 2 ? `#${anchorFor('car-care')}` : '#contact'}
                      className="lp-btn lp-btn-ghost lp-btn-sm"
                    >
                      {column.action}
                    </a>
                  </Reveal>
                ))}
              </div>

              <Reveal as="p" className="lp-mono lp-note">
                {copy.buy.note}
              </Reveal>
              <Reveal className="lp-hero-cta" index={1}>
                {copy.buy.actions.map((action) => (
                  <a key={action} href="#contact" className="lp-btn lp-btn-ghost">
                    {action}
                  </a>
                ))}
              </Reveal>
            </div>
          </section>

          {/* 09 — for suppliers · 10 — marketplace journey */}
          <section id="sell" className="lp-wrap lp-section">
            <Reveal as="p" className="lp-tag">
              {copy.sell.tag}
            </Reveal>
            <Reveal as="h2" className="lp-title" index={1}>
              {copy.sell.title}
            </Reveal>
            <Reveal index={2}>
              <span className="lp-badge lp-badge-block">{copy.sell.status}</span>
            </Reveal>
            <Reveal as="p" className="lp-lede" index={3}>
              {copy.sell.sub}
            </Reveal>

            <div className="lp-grid-2" style={{ marginTop: '36px' }}>
              <Reveal className="lp-card">
                <h3>{copy.sell.categoriesTitle}</h3>
                <ul className="lp-bullets">
                  {copy.sell.categories.map((category) => (
                    <li key={category}>{category}</li>
                  ))}
                </ul>
              </Reveal>
              <Reveal className="lp-card" index={1}>
                <h3>{copy.sell.capabilitiesTitle}</h3>
                <ul className="lp-bullets">
                  {copy.sell.capabilities.map((capability) => (
                    <li key={capability}>{capability}</li>
                  ))}
                </ul>
              </Reveal>
            </div>

            <Reveal className="lp-hero-cta">
              <a href="#contact" className="lp-btn lp-btn-primary">
                {copy.sell.cta}
              </a>
            </Reveal>

            <Reveal id="market" className="lp-market">
              <p className="lp-tag lp-tag-teal">{copy.market.tag}</p>
              <h3 className="lp-h3">{copy.market.title}</h3>
              <MarketFlow steps={copy.market.steps} label={copy.market.flowLabel} />
              <p className="lp-muted">{copy.market.sub}</p>
            </Reveal>
          </section>

          {/* 11–13 — the remaining entity chapters */}
          <section className="lp-band" aria-label={copy.ecosystem.title}>
            <div className="lp-wrap">
              {chapters.map((entity, index) => (
                <Reveal
                  key={entity.id}
                  id={anchorFor(entity.id)}
                  className="lp-chapter"
                  index={index}
                >
                  <div>
                    <div className="lp-prod-name">
                      <span className="lp-p-en lp-ltr">{entity.nameEn}</span>
                      {entity.nameAr !== entity.nameEn && (
                        <span className="lp-p-ar">{entity.nameAr}</span>
                      )}
                      <StatusBadge entity={entity} locale={locale} />
                    </div>
                    <p className="lp-mono lp-teal lp-endorse">{entity.endorsement[locale]}</p>
                    <p className="lp-lede">{entity.description[locale]}</p>
                    <a href="#contact" className="lp-btn lp-btn-ghost lp-btn-sm">
                      {entity.cta[locale]}
                    </a>
                  </div>
                  <div className="lp-prod-visual" aria-hidden="true">
                    <ChapterArc accentRole={entity.accentRole} />
                  </div>
                </Reveal>
              ))}
            </div>
          </section>

          {/* 14 — fit finder */}
          <section id="fit" className="lp-wrap lp-section">
            <Reveal as="p" className="lp-tag lp-tag-teal">
              {copy.fit.tag}
            </Reveal>
            <Reveal as="h2" className="lp-title" index={1}>
              {copy.fit.title}
            </Reveal>
            <FitFinder locale={locale} copy={copy} entities={entities} />
            <p className="lp-mono lp-note">{copy.fit.disclaimer}</p>
          </section>

          {/* 15 — what we are building now */}
          <section id="activity" className="lp-band">
            <div className="lp-wrap">
              <Reveal as="p" className="lp-tag">
                {copy.activity.tag}
              </Reveal>
              <Reveal as="h2" className="lp-title" index={1}>
                {copy.activity.title}
              </Reveal>
              <div className="lp-status-board">
                {entities.map((entity, index) => (
                  <Reveal key={entity.id} className="lp-status-row" index={index}>
                    <div className="lp-status-top">
                      <b className="lp-ltr">{entity.nameEn}</b>
                      <span className="lp-sig" data-status={entity.status}>
                        <span className="lp-sig-dot" aria-hidden="true" />
                        {entity.statusLabel[locale]}
                      </span>
                    </div>
                    <span className="lp-status-label lp-mono">{copy.activity.directionLabel}</span>
                    <p>{entity.direction[locale]}</p>
                  </Reveal>
                ))}
              </div>
              <Reveal as="p" className="lp-mono lp-note">
                {copy.activity.note}
              </Reveal>
            </div>
          </section>

          {/* 16 — how we work · 17 — platforms · 18 — benefits */}
          <section id="how" className="lp-wrap lp-section">
            <Reveal as="p" className="lp-tag">
              {copy.how.tag}
            </Reveal>
            <Reveal as="h2" className="lp-title" index={1}>
              {copy.how.title}
            </Reveal>
            <div className="lp-cards-4">
              {copy.how.steps.map((step, index) => (
                <Reveal key={step.title} as="article" className="lp-card" index={index}>
                  <span className="lp-mono lp-teal lp-ltr">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </Reveal>
              ))}
            </div>

            <div className="lp-grid-2" style={{ marginTop: '72px', alignItems: 'center' }}>
              <div>
                <Reveal as="p" className="lp-tag">
                  {copy.platforms.tag}
                </Reveal>
                <Reveal as="h2" className="lp-title" index={1}>
                  {copy.platforms.title}
                </Reveal>
                <Reveal as="p" className="lp-lede" index={2}>
                  {copy.platforms.sub}
                </Reveal>
              </div>
              <Reveal className="lp-platforms">
                <span className="lp-pv lp-mono" data-surface="web" aria-hidden="true">
                  {copy.platforms.surfaces[0]}
                </span>
                <span className="lp-pv lp-mono" data-surface="desktop" aria-hidden="true">
                  {copy.platforms.surfaces[1]}
                </span>
                <span className="lp-pv lp-mono" data-surface="mobile" aria-hidden="true">
                  {copy.platforms.surfaces[2]}
                </span>
              </Reveal>
            </div>

            <div style={{ marginTop: '72px' }}>
              <Reveal as="p" className="lp-tag">
                {copy.benefits.tag}
              </Reveal>
              <Reveal as="h2" className="lp-title" index={1}>
                {copy.benefits.title}
              </Reveal>
              <Reveal className="lp-chip-row" index={2}>
                {copy.benefits.items.map((item) => (
                  <span key={item} className="lp-chip">
                    {item}
                  </span>
                ))}
              </Reveal>
            </div>
          </section>

          {/* 19 — trust and boundaries */}
          <section id="trust" className="lp-band">
            <div className="lp-wrap">
              <Reveal as="p" className="lp-tag">
                {copy.trust.tag}
              </Reveal>
              <Reveal as="h2" className="lp-title" index={1}>
                {copy.trust.title}
              </Reveal>
              <div className="lp-trust">
                {copy.trust.items.map((item, index) => (
                  <Reveal key={item} className="lp-trust-item" index={index}>
                    {item}
                  </Reveal>
                ))}
              </div>
            </div>
          </section>

          {/* 20 — FAQ */}
          <section id="faq" className="lp-wrap lp-section">
            <Reveal as="p" className="lp-tag">
              {copy.faq.tag}
            </Reveal>
            <Reveal as="h2" className="lp-title" index={1}>
              {copy.faq.title}
            </Reveal>
            <Reveal className="lp-faq">
              {copy.faq.items.map((item) => (
                <details key={item.question} className="lp-faq-item">
                  <summary>{item.question}</summary>
                  <p>{item.answer}</p>
                </details>
              ))}
            </Reveal>
          </section>

          {/* 21 — closing call to action */}
          <section id="contact" className="lp-wrap lp-section">
            <Reveal className="lp-cta-card">
              <span className="lp-cta-mark lp-floaty" aria-hidden="true">
                <Mark size={56} />
              </span>
              <h2 className="lp-cta-title">{copy.contact.title}</h2>
              <p className="lp-lede">{copy.contact.sub}</p>
              <ContactForm copy={copy} />
            </Reveal>
          </section>
        </main>
      </SelectionProvider>

      {/* 22 — footer */}
      <LandingFooter
        locale={locale}
        copy={copy}
        entities={entities}
        otherLocaleHref={href(otherLocale, '/')}
      />
    </div>
  );
}
