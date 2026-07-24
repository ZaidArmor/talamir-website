import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/seo';
import { publicIndexingEnabled } from '@/lib/visibility';

/**
 * robots.txt.
 *
 * The visibility gate again, at the crawl layer this time. The identity is
 * approved, but the deployed design has not been verified in production, and a
 * premature listing is slow and expensive to correct.
 *
 * This flips only when NEXT_PUBLIC_PUBLIC_INDEXING is explicitly set — see
 * src/lib/visibility.ts. Nothing about a brand edit can turn it on by itself.
 */
export default function robots(): MetadataRoute.Robots {
  if (!publicIndexingEnabled) {
    return { rules: [{ userAgent: '*', disallow: '/' }] };
  }

  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
