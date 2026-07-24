import type { Locale } from '../types';
import type { LandingCopy } from './types';
import { landingAr } from './ar';
import { landingEn } from './en';

export type * from './types';
export { ecosystem, orderedEcosystem, entityById } from './ecosystem';

/**
 * The one entry point components use to read landing copy.
 *
 * Keeping the dictionaries behind a loader means the storage can change —
 * to a CMS, to a fetch, to per-section code splitting — without any component
 * learning about it, which is the same discipline `src/content/index.ts`
 * applies to the rest of the site.
 */
const dictionaries: Record<Locale, LandingCopy> = { ar: landingAr, en: landingEn };

export const landingCopy = (locale: Locale): LandingCopy => dictionaries[locale];
