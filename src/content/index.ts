import { products } from './products';
import { solutions, industries } from './taxonomies';
import { posts, docs, roles, press } from './editorial';
import type {
  ContentBase,
  DocPage,
  Industry,
  Post,
  PressItem,
  Product,
  Role,
  Solution,
} from './types';

export * from './types';

/**
 * The content access boundary.
 *
 * Pages never import `products.ts` or `editorial.ts` directly — they call the
 * loaders here. That indirection is what makes the CMS swap cheap: replacing
 * local modules with fetches from a headless CMS means rewriting this file
 * alone, because every caller already treats loading as async-shaped data
 * access rather than a module import.
 */

/**
 * Drafts render in development and are withheld in production.
 *
 * This is the mechanism that lets unfinished sections exist in the repository
 * without ever putting unapproved claims in front of the public.
 */
const isVisible = (entry: ContentBase): boolean =>
  entry.state === 'published' ||
  (process.env.NODE_ENV === 'development' && entry.state !== 'archived');

const visible = <T extends ContentBase>(entries: T[]): T[] => entries.filter(isVisible);

const bySlug = <T extends ContentBase>(entries: T[], slug: string): T | undefined =>
  visible(entries).find((e) => e.slug === slug);

/* -------------------------------------------------------------------- lists */

export const getProducts = (): Product[] => visible(products);
export const getSolutions = (): Solution[] => visible(solutions);
export const getIndustries = (): Industry[] => visible(industries);
export const getRoles = (): Role[] => visible(roles);
export const getPress = (): PressItem[] =>
  visible(press).sort((a, b) => b.published.localeCompare(a.published));

export const getPosts = (): Post[] =>
  visible(posts).sort((a, b) => b.published.localeCompare(a.published));

export const getDocs = (): DocPage[] => visible(docs).sort((a, b) => a.order - b.order);

/* ------------------------------------------------------------------ singles */

export const getProduct = (slug: string): Product | undefined => bySlug(products, slug);
export const getSolution = (slug: string): Solution | undefined => bySlug(solutions, slug);
export const getIndustry = (slug: string): Industry | undefined => bySlug(industries, slug);
export const getPost = (slug: string): Post | undefined => bySlug(posts, slug);
export const getDoc = (slug: string): DocPage | undefined => bySlug(docs, slug);
export const getRole = (slug: string): Role | undefined => bySlug(roles, slug);

/* ------------------------------------------------------------------ derived */

/** Docs grouped into sidebar sections, order preserved. */
export const getDocSections = (): Array<{ section: DocPage['section']; pages: DocPage[] }> => {
  const groups = new Map<string, { section: DocPage['section']; pages: DocPage[] }>();
  for (const page of getDocs()) {
    const key = page.section.en;
    const group = groups.get(key) ?? { section: page.section, pages: [] };
    group.pages.push(page);
    groups.set(key, group);
  }
  return [...groups.values()];
};

/**
 * Everything that has a URL, for the sitemap and internal search.
 * A new content type becomes discoverable by adding one line here.
 */
export const getAllRoutableContent = (): Array<{ path: string; updated: string }> => [
  ...getProducts().map((p) => ({ path: `/products/${p.slug}`, updated: p.updated })),
  ...getSolutions().map((s) => ({ path: `/solutions/${s.slug}`, updated: s.updated })),
  ...getIndustries().map((i) => ({ path: `/industries/${i.slug}`, updated: i.updated })),
  ...getPosts().map((p) => ({ path: `/blog/${p.slug}`, updated: p.updated })),
  ...getDocs().map((d) => ({ path: `/documentation/${d.slug}`, updated: d.updated })),
  ...getRoles().map((r) => ({ path: `/careers/${r.slug}`, updated: r.updated })),
];
