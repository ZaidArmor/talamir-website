import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';

/**
 * Production visibility and route integrity, asserted against the **real build
 * output** rather than against source intent.
 *
 * This is the difference that matters: source can express a rule that the
 * framework silently overrides. These tests read what would actually be served.
 */

const BUILD = join(process.cwd(), '.next', 'server', 'app');

const htmlFiles = (): string[] => {
  const walk = (dir: string): string[] =>
    readdirSync(dir).flatMap((entry) => {
      const full = join(dir, entry);
      return statSync(full).isDirectory() ? walk(full) : full.endsWith('.html') ? [full] : [];
    });
  return walk(BUILD);
};

const routeOf = (file: string): string =>
  '/' +
  relative(BUILD, file)
    .split(sep)
    .join('/')
    .replace(/\.html$/, '');

beforeAll(() => {
  if (!existsSync(BUILD)) {
    throw new Error('No build output. Run `npm run build` before this suite.');
  }
});

describe('production visibility — search engines are blocked', () => {
  it('emits robots.txt disallowing the entire site', () => {
    const body = readFileSync(join(BUILD, 'robots.txt.body'), 'utf8');
    expect(body).toMatch(/User-Agent:\s*\*/i);
    expect(body).toMatch(/Disallow:\s*\//);
    expect(body, 'must not advertise a sitemap while disallowing').not.toMatch(/Sitemap:/i);
  });

  it('emits an empty sitemap — advertising nothing while noindex', () => {
    const body = readFileSync(join(BUILD, 'sitemap.xml.body'), 'utf8');
    expect(body).toContain('<urlset');
    expect(body, 'sitemap must contain no URLs').not.toContain('<url>');
  });

  it('marks every content page noindex, nofollow, nocache', () => {
    const offenders: string[] = [];
    for (const file of htmlFiles()) {
      const route = routeOf(file);
      // Next's own not-found route emits the framework default `noindex`.
      if (route === '/_not-found') continue;

      const html = readFileSync(file, 'utf8');
      if (!/<meta name="robots" content="noindex, nofollow, nocache"\/?>/.test(html)) {
        offenders.push(route);
      }
    }
    expect(offenders, `pages missing the full robots directive: ${offenders.join(', ')}`).toEqual(
      [],
    );
  });

  it('still blocks indexing on the not-found route', () => {
    const html = readFileSync(join(BUILD, '_not-found.html'), 'utf8');
    expect(html).toMatch(/<meta name="robots" content="noindex/);
  });

  it('emits no Organisation or Product structured data', () => {
    for (const file of htmlFiles()) {
      const html = readFileSync(file, 'utf8');
      expect(html, `${routeOf(file)} emits Organization schema`).not.toContain(
        '"@type":"Organization"',
      );
      expect(html, `${routeOf(file)} emits Product schema`).not.toContain('"@type":"Product"');
    }
  });
});

describe('draft content is withheld from production', () => {
  const routes = () => htmlFiles().map(routeOf);

  it('prerenders no Solutions detail page', () => {
    expect(routes().filter((r) => /^\/(ar|en)\/solutions\/.+/.test(r))).toEqual([]);
  });

  it('prerenders no Industries detail page', () => {
    expect(routes().filter((r) => /^\/(ar|en)\/industries\/.+/.test(r))).toEqual([]);
  });

  it('still prerenders their index pages, so the sections exist', () => {
    const r = routes();
    expect(r).toContain('/ar/solutions');
    expect(r).toContain('/ar/industries');
  });
});

describe('route integrity', () => {
  it('prerenders both locales of every public page', () => {
    const routes = htmlFiles()
      .map(routeOf)
      .filter((r) => r.startsWith('/ar/') || r.startsWith('/en/') || r === '/ar' || r === '/en');

    const ar = routes.filter((r) => r.startsWith('/ar')).map((r) => r.replace(/^\/ar/, ''));
    const en = routes.filter((r) => r.startsWith('/en')).map((r) => r.replace(/^\/en/, ''));

    expect(ar.sort()).toEqual(en.sort());
  });

  it('has no broken internal link — every href resolves to a prerendered page', () => {
    const available = new Set(htmlFiles().map(routeOf));
    const broken: string[] = [];

    for (const file of htmlFiles()) {
      const route = routeOf(file);
      const html = readFileSync(file, 'utf8');

      for (const match of html.matchAll(/href="(\/[^"#?]*)"/g)) {
        const target = match[1].replace(/\/$/, '');
        if (target === '') continue;
        // Build assets (stylesheet and chunk preloads) are not navigation.
        if (target.startsWith('/_next/')) continue;
        // Generated SEO files are not prerendered as .html.
        if (target === '/robots.txt' || target === '/sitemap.xml') continue;

        if (!available.has(target)) broken.push(`${route} → ${target}`);
      }
    }

    expect([...new Set(broken)], 'broken internal links').toEqual([]);
  });

  it('exposes no route implying commerce or availability', () => {
    const forbidden = /(pricing|checkout|cart|buy|purchase|trial|signup|subscribe|order)/i;
    for (const route of htmlFiles().map(routeOf)) {
      expect(route, `${route} implies commerce`).not.toMatch(forbidden);
    }
  });
});
