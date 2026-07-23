import { NextResponse, type NextRequest } from 'next/server';
import { defaultLocale, locales } from '@/lib/i18n';

/**
 * Locale routing.
 *
 * Every page lives under `/{locale}/…`. A request without a locale prefix is
 * redirected rather than rewritten, so there is exactly one canonical URL per
 * page and no duplicate-content problem for search engines.
 *
 * The visitor's `Accept-Language` is consulted, but Arabic remains the default
 * for anyone who does not clearly prefer English — this is an Arabic-first
 * company, and the fallback should reflect that rather than defaulting to
 * English out of habit.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
  if (hasLocale) return NextResponse.next();

  const accepts = request.headers.get('accept-language') ?? '';
  const prefersEnglish = /\ben\b/i.test(accepts) && !/\bar\b/i.test(accepts);
  const locale = prefersEnglish ? 'en' : defaultLocale;

  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === '/' ? '' : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Static assets, API routes and the SEO files must not be locale-prefixed.
  matcher: ['/((?!_next|api|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)'],
};
