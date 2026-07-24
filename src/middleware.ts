import { NextResponse, type NextRequest } from 'next/server';
import { defaultLocale, locales } from '@/lib/i18n';

/**
 * Locale routing.
 *
 * Every page lives under `/{locale}/…`. A request without a locale prefix is
 * redirected rather than rewritten, so there is exactly one canonical URL per
 * page and no duplicate-content problem for search engines.
 *
 * The site root is deliberately **not** negotiated. `/` always lands on the
 * approved default locale, so the brand's entry point is one stable URL that
 * every visitor, crawler and shared link resolves to identically. Content
 * negotiation on the root would make the canonical home vary by request header,
 * which is exactly the ambiguity a public landing page should not have.
 *
 * Deeper unprefixed paths still consult `Accept-Language`, because there the
 * visitor asked for a specific page and their language preference is the only
 * signal available. Arabic remains the fallback for anyone who does not clearly
 * prefer English — this is an Arabic-first company.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
  if (hasLocale) return NextResponse.next();

  const accepts = request.headers.get('accept-language') ?? '';
  const prefersEnglish = pathname !== '/' && /\ben\b/i.test(accepts) && !/\bar\b/i.test(accepts);
  const locale = prefersEnglish ? 'en' : defaultLocale;

  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === '/' ? '' : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Static assets, API routes and the SEO files must not be locale-prefixed.
  matcher: ['/((?!_next|api|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)'],
};
