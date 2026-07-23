import type { MetadataRoute } from 'next';
import { isPlaceholderIdentity } from '@brand/index';
import { siteUrl } from '@/lib/seo';

/**
 * robots.txt.
 *
 * The identity gate again, at the crawl layer this time. A site whose trading
 * name has not been validated must not be indexed under that name — search
 * results and knowledge panels are slow to correct, and a premature listing
 * would prejudice the name-validation decision itself.
 *
 * This flips automatically when the brand definition reaches `approved`. No
 * separate deployment checklist item to forget.
 */
export default function robots(): MetadataRoute.Robots {
  if (isPlaceholderIdentity) {
    return { rules: [{ userAgent: '*', disallow: '/' }] };
  }

  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
