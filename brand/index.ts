import type { BrandDefinition } from './brand.types';
import { placeholderBrand } from './brand.placeholder';
import { swapTestBrand } from './brand.swap-test';

export type * from './brand.types';

/**
 * The brand registry — the single swap point for the whole site.
 *
 * To introduce the real identity later:
 *   1. add `brand.talamir.ts` exporting a `BrandDefinition`;
 *   2. register it below;
 *   3. set `BRAND_ID=talamir` in the environment.
 *
 * Nothing else in the repository changes. No component, page, or layout
 * references a colour, font or timing outside this registry.
 */
const registry: Record<string, BrandDefinition> = {
  placeholder: placeholderBrand,
  // A fixture, not a candidate — it exists so the swap can be *verified*
  // rather than assumed. See brand.swap-test.ts.
  'swap-test': swapTestBrand,
};

const requested = process.env.NEXT_PUBLIC_BRAND_ID ?? 'placeholder';

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
