import { isPlaceholderIdentity } from '@brand/index';

/**
 * The public-indexing gate.
 *
 * Identity approval and search-engine visibility used to be the same switch:
 * `brand.status === 'approved'` lifted `noindex`, emptied nothing from the
 * sitemap and turned on structured data, all at once. That coupling was right
 * while the only reason to stay hidden was an unvalidated name. It is wrong
 * now — the identity is approved but the deployed design has not been verified
 * in production, and those are separate decisions with separate owners.
 *
 * So indexing is its own explicit, opt-in switch:
 *
 *   NEXT_PUBLIC_PUBLIC_INDEXING=enabled
 *
 * Anything else — unset, empty, `false`, a typo — keeps the site hidden.
 * Fail-closed is the only safe default here: a site wrongly indexed cannot be
 * un-indexed on demand, while a site wrongly hidden costs a redeploy.
 *
 * The identity gate is retained as a floor. An unapproved identity can never be
 * indexed regardless of this flag, so setting it on a placeholder build does
 * nothing.
 */
export const publicIndexingEnabled: boolean =
  !isPlaceholderIdentity && process.env.NEXT_PUBLIC_PUBLIC_INDEXING === 'enabled';

/**
 * Whether the site may emit Organisation/WebSite structured data.
 *
 * Tied to indexing rather than to identity approval: structured data exists to
 * be consumed by crawlers, and publishing it to crawlers that are simultaneously
 * told not to index the site is a contradiction. It switches on with indexing.
 */
export const structuredDataEnabled: boolean = publicIndexingEnabled;
