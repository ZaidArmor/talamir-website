import type { Locale } from '../types';

/**
 * The landing-page content model.
 *
 * The approved design ships its copy as two parallel dictionaries, one per
 * language. That shape is kept — but typed, so a missing Arabic string is a
 * compile error rather than an empty element at runtime. `LandingCopy` is the
 * contract; `ar.ts` and `en.ts` are two implementations of it, and TypeScript
 * guarantees they stay structurally identical.
 *
 * Ecosystem entities are modelled separately in `ecosystem.ts`, because they are
 * *data* rather than page copy: adding an entity there makes it appear in the
 * map, the status board, the product chapters, the footer and the fit finder
 * without touching a component.
 */

/** Whether an entity is a shipping brand or a platform still being built. */
export type EntityStatus = 'operating' | 'building';

export interface EcosystemEntity {
  /** Stable id. Doubles as the in-page anchor target. */
  id: string;
  /** Display order across every surface that lists entities. */
  order: number;
  /** Latin name — rendered identically in both locales. */
  nameEn: string;
  /** Arabic name. Equal to `nameEn` where the name is not transliterated. */
  nameAr: string;
  status: EntityStatus;
  /** Which colour role draws this entity's chapter arc. */
  accentRole: 'accent' | 'accent-hover' | 'accent-deep' | 'text-muted';
  type: Record<Locale, string>;
  /** The parent-brand relationship, stated explicitly on every surface. */
  endorsement: Record<Locale, string>;
  description: Record<Locale, string>;
  /** One line for the status board: what is being worked on, not how far along. */
  direction: Record<Locale, string>;
  cta: Record<Locale, string>;
  statusLabel: Record<Locale, string>;
}

export interface TitledItem {
  title: string;
  body: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface FitResult {
  why: string;
  benefits: string[];
}

/** The four questions the fit finder asks, in order. */
export interface FitQuestion {
  question: string;
  options: string[];
}

export interface LandingCopy {
  meta: { title: string; description: string };

  nav: {
    ecosystem: string;
    buy: string;
    sell: string;
    fit: string;
    activity: string;
    faq: string;
    cta: string;
    skip: string;
    primaryLabel: string;
    menuLabel: string;
    openMenu: string;
    closeMenu: string;
    languageLabel: string;
    homeLabel: string;
  };

  preloader: { line: string };

  hero: {
    kicker: string;
    title: string;
    /** The tagline in the *other* language, shown beneath the headline. */
    alt: string;
    sub: string;
    primaryCta: string;
    secondaryCta: string;
  };

  paths: {
    title: string;
    sub: string;
    /** Four prompts, each pointing at an ecosystem entity id. */
    options: Array<{ label: string; target: string }>;
    chosen: string;
  };

  about: { tag: string; title: string; paragraphs: [string, string, string] };

  builds: { title: string; items: TitledItem[] };

  ecosystem: {
    tag: string;
    title: string;
    sub: string;
    hint: string;
    boundary: string;
    mapLabel: string;
    panelLabel: string;
  };

  sultan: {
    tag: string;
    title: string;
    experiencesTitle: string;
    experiences: string[];
    note: string;
  };

  buy: {
    tag: string;
    title: string;
    columns: [
      { title: string; items: string[]; action: string },
      { title: string; items: string[]; action: string },
      { title: string; items: string[]; action: string },
    ];
    note: string;
    actions: [string, string, string];
  };

  sell: {
    tag: string;
    title: string;
    status: string;
    sub: string;
    categoriesTitle: string;
    categories: string[];
    capabilitiesTitle: string;
    capabilities: string[];
    cta: string;
  };

  market: { tag: string; title: string; steps: string[]; sub: string; flowLabel: string };

  fit: {
    tag: string;
    title: string;
    restart: string;
    /** Announced to assistive technology as the step changes. */
    progressLabel: string;
    questions: [FitQuestion, FitQuestion, FitQuestion, FitQuestion];
    whyTitle: string;
    benefitsTitle: string;
    statusTitle: string;
    disclaimer: string;
    results: Record<string, FitResult>;
  };

  activity: { tag: string; title: string; directionLabel: string; note: string };

  how: { tag: string; title: string; steps: TitledItem[] };

  platforms: { tag: string; title: string; sub: string; surfaces: [string, string, string] };

  benefits: { tag: string; title: string; items: string[] };

  trust: { tag: string; title: string; items: string[] };

  faq: { tag: string; title: string; items: FaqItem[] };

  contact: {
    title: string;
    sub: string;
    fields: {
      name: string;
      company: string;
      city: string;
      contact: string;
      challenge: string;
    };
    selects: {
      business: { label: string; options: string[] };
      product: { label: string; options: string[] };
      timeline: { label: string; options: string[] };
      preference: { label: string; options: string[] };
    };
    consent: string;
    submit: string;
    /** Shown when no intake endpoint is configured — the honest default. */
    disabledNote: string;
    incompleteNote: string;
  };

  footer: {
    blurb: string;
    navLabel: string;
    ecosystemLabel: string;
    rights: string;
    signature: string;
  };
}
