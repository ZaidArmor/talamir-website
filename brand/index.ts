import type { BrandDefinition } from './brand.types';
import { placeholderBrand } from './brand.placeholder';
import { swapTestBrand } from './brand.swap-test';
import { talamirBrand } from './brand.talamir';

export type * from './brand.types';

/**
 * The brand registry — the single swap point for the whole site.
 *
 * The swap the placeholder was built for has now happened: `talamir` is the
 * approved identity and the default. The placeholder is kept registered rather
 * than deleted, because it is the fixture the swap tests compare against — the
 * proof that the identity layer works is only meaningful while both ends of
 * the swap still exist.
 *
 * Nothing else in the repository changes to move between them. No component,
 * page, or layout references a colour, font or timing outside this registry.
 */
const registry: Record<string, BrandDefinition> = {
  talamir: talamirBrand,
  placeholder: placeholderBrand,
  // A fixture, not a candidate — it exists so the swap can be *verified*
  // rather than assumed. See brand.swap-test.ts.
  'swap-test': swapTestBrand,
};

const requested = process.env.NEXT_PUBLIC_BRAND_ID ?? 'talamir';

const resolved = registry[requested];

if (!resolved) {
  // Fail loudly rather than silently serving the placeholder in production —
  // a typo'd BRAND_ID must not look like a successful identity swap.
  throw new Error(
    `Unknown BRAND_ID "${requested}". Registered ids: ${Object.keys(registry).join(', ')}`,
  );
}

export const brand: BrandDefinition = resolved;

/** True while the site must keep showing placeholder scaffolding. */
export const isPlaceholderIdentity = brand.status !== 'approved';
