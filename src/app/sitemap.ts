import type { MetadataRoute } from 'next';
import { getAllRoutableContent } from '@/content';
import { footerNav } from '@/content/navigation';
import { locales } from '@/lib/i18n';
import { siteUrl } from '@/lib/seo';
import { publicIndexingEnabled } from '@/lib/visibility';

/**
 * XML sitemap.
 *
 * Derived from the same navigation tree and content registries the site renders
 * from — there is no separate list to maintain. Every URL carries `alternates`
 * so search engines see the Arabic and English versions as one page in two
 * languages rather than duplicates.
 *
 * While public indexing is disabled the sitemap is empty, matching the
 * site-wide `noindex` in `lib/seo.ts`. Submitting URLs for indexing while
 * telling crawlers not to index them is a contradiction, and the honest form of
 * "do not index this yet" is to advertise nothing.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  if (!publicIndexingEnabled) return [];

  // Static section landings, from the navigation tree.
  const staticPaths = new Set<string>(['/']);
  for (const section of footerNav()) {
    staticPaths.add(section.path);
    for (const child of section.children) staticPaths.add(child.path);
  }

  const now = new Date().toISOString();

  const entries: MetadataRoute.Sitemap = [];

  const push = (path: string, updated: string) => {
    for (const locale of locales) {
      entries.push({
        url: `${siteUrl}/${locale}${path === '/' ? '' : path}`,
        lastModified: updated,
        alternates: {
          languages: Object.fromEntries(
            locales.map((l) => [l, `${siteUrl}/${l}${path === '/' ? '' : path}`]),
          ),
        },
      });
    }
  };

  for (const path of staticPaths) push(path, now);
  for (const { path, updated } of getAllRoutableContent()) push(path, updated);

  return entries;
}
