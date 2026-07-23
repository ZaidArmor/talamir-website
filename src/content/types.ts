/**
 * The content model.
 *
 * This is the site's CMS schema expressed in TypeScript. It is deliberately
 * source-agnostic: today the entries are local modules, tomorrow they can be
 * fetched from a headless CMS. Pages only ever consume these types via the
 * loaders in `src/content/index.ts`, so the storage swap touches the loaders
 * and nothing else. See `docs/09-cms-architecture.md`.
 */

/** Everything user-facing is bilingual. Arabic first — it is the primary locale. */
export interface Localized {
  ar: string;
  en: string;
}

export type Locale = 'ar' | 'en';

/**
 * What the site is permitted to say about an item.
 *
 * `talamir-product-portfolio` holds no approved source for any commercial,
 * legal, or launch claim. This field carries that governance onto the website
 * so marketing copy cannot outrun the register. `npm run content:check`
 * fails the build if a `structural` entry carries commercial language.
 */
export type ClaimLevel =
  /** Name and category only. No capability, availability, or performance claim. */
  | 'structural'
  /** Capabilities described, but nothing about availability or pricing. */
  | 'descriptive'
  /** Cleared for commercial statements. Requires an approved source on file. */
  | 'commercial';

/** Publication state. Only `published` renders; the rest are visible in dev. */
export type PublishState = 'draft' | 'review' | 'published' | 'archived';

export interface ContentBase {
  /** URL segment. Stable — changing it requires a redirect entry. */
  slug: string;
  title: Localized;
  /** One sentence. Used for cards, meta description fallback, and OG text. */
  summary: Localized;
  claimLevel: ClaimLevel;
  state: PublishState;
  /** ISO date. Drives sitemap lastmod and article schema. */
  updated: string;
}

/* ------------------------------------------------------------------ products */

/**
 * A TALAMIR product. Adding a future product means appending one entry —
 * routes, navigation, sitemap, search and schema all derive from this list.
 */
export interface Product extends ContentBase {
  /** Portfolio code from the register, e.g. `PRD-VEXORA`. The join key. */
  code: string;
  category: Localized;
  /**
   * Mirrors the portfolio register's lifecycle stage. `null` means the register
   * says `UNKNOWN — OWNER INPUT REQUIRED`, and the page renders that honestly
   * instead of inventing a stage.
   */
  lifecycleStage: Localized | null;
  /** Capability statements. Empty while claimLevel is `structural`. */
  capabilities: Array<{ title: Localized; body: Localized }>;
  /** Slugs of solutions this product serves. Drives cross-linking both ways. */
  solutions: string[];
  /** Slugs of industries. Same bidirectional derivation. */
  industries: string[];
  /** Documentation entry point, when documentation exists. */
  docsSlug: string | null;
}

/* ----------------------------------------------------------------- solutions */

/** A problem shape, described independently of which product solves it. */
export interface Solution extends ContentBase {
  /** The outcome sought, in the customer's words. */
  outcome: Localized;
  /** Stages of the problem, rendered as the solution narrative. */
  stages: Array<{ title: Localized; body: Localized }>;
}

/* ---------------------------------------------------------------- industries */

export interface Industry extends ContentBase {
  /** Sector-specific pressures. Rendered as the page's spine. */
  pressures: Array<{ title: Localized; body: Localized }>;
  /** Regulatory context, where one demonstrably applies. */
  regulatoryNote: Localized | null;
}

/* ---------------------------------------------------------- editorial + docs */

export interface Post extends ContentBase {
  /** Display name only. No fabricated author identities. */
  author: Localized;
  published: string;
  tags: string[];
  /** Body is markdown, resolved by the loader. */
  body: Localized;
}

export interface DocPage extends ContentBase {
  /** Section grouping in the docs sidebar. */
  section: Localized;
  /** Sort order within the section. */
  order: number;
  /** Product this documents, if any. */
  productCode: string | null;
  body: Localized;
}

/* --------------------------------------------------------------------- other */

export interface Role extends ContentBase {
  department: Localized;
  location: Localized;
  /** `null` where the arrangement is not decided. */
  employmentType: Localized | null;
  responsibilities: Localized[];
  requirements: Localized[];
}

export interface PressItem extends ContentBase {
  /** Where it was published. Only real, verifiable sources belong here. */
  source: Localized;
  published: string;
  url: string | null;
}

/** Anything the site can list and link. Used by search and sitemap builders. */
export type ContentEntry = Product | Solution | Industry | Post | DocPage | Role | PressItem;
