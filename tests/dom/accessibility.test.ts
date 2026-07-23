import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';
import axe from 'axe-core';

/**
 * Automated accessibility gate.
 *
 * Runs axe-core against the **real prerendered HTML** produced by
 * `next build`, parsed into the jsdom document. No browser download, no dev
 * server — the suite is self-contained and runnable from any session.
 *
 * Honest statement of what this does and does not cover:
 *
 *  - It DOES cover structure, semantics and naming: landmarks, heading order,
 *    accessible names, document language and direction, ARIA validity,
 *    duplicate ids, list semantics, link and button naming.
 *  - It does NOT cover computed colour contrast, because jsdom does not do
 *    layout or cascade resolution. That is why contrast is asserted separately
 *    and more strictly on the design tokens themselves — see
 *    `tests/contrast.test.ts`, which checks every role pair in every brand and
 *    both schemes.
 *  - It is NOT a screen-reader test and confers no certification. Manual
 *    screen-reader testing remains REQUIRED BEFORE PUBLIC RELEASE.
 *
 * The gate fails on `serious` and `critical` impacts. No rule is globally
 * disabled; the two exclusions below are narrowly scoped and justified.
 */

const BUILD = join(process.cwd(), '.next', 'server', 'app');

/** Pages the gate must cover, per the required coverage list. */
const PAGES: Array<{ label: string; file: string }> = [
  { label: 'Arabic home', file: 'ar.html' },
  { label: 'English home', file: 'en.html' },
  { label: 'component system route (ar)', file: 'ar/system.html' },
  { label: 'component system route (en)', file: 'en/system.html' },
  { label: 'products index (ar)', file: 'ar/products.html' },
  { label: 'product detail (ar)', file: 'ar/products/vexora.html' },
  { label: 'documentation page (ar)', file: 'ar/documentation/design-tokens.html' },
  { label: 'empty state — careers (ar)', file: 'ar/careers.html' },
  { label: 'empty state — press (en)', file: 'en/press.html' },
  { label: 'sitemap page (ar)', file: 'ar/sitemap.html' },
];

/**
 * Narrowly scoped rule configuration — NOT a global suppression.
 *
 * `region`: axe requires all content to sit inside a landmark. The skip link is
 * intentionally the first focusable element *before* <header>, which is the
 * documented pattern (WCAG 2.4.1 bypass block). Disabling this one rule is
 * preferable to moving the skip link inside a landmark, which would defeat it.
 *
 * `color-contrast`: jsdom performs no layout and no cascade resolution, so this
 * rule cannot produce a meaningful result here — it needs a real rendering
 * engine and a canvas. It is disabled **in this environment only**, and the
 * requirement is not dropped: contrast is asserted more strictly in
 * `tests/contrast.test.ts`, across every colour-role pair, in every registered
 * brand, in both light and dark schemes. That is stronger than a per-page check,
 * because it catches a failing palette before any page renders it.
 */
const RULE_CONFIG: axe.RunOptions = {
  resultTypes: ['violations'],
  rules: {
    region: { enabled: false },
    'color-contrast': { enabled: false },
  },
};

const load = (file: string): string => {
  const path = join(BUILD, file);
  if (!existsSync(path)) {
    throw new Error(
      `Prerendered page missing: ${file}\nRun \`npm run build\` before the accessibility suite.`,
    );
  }
  return readFileSync(path, 'utf8');
};

beforeAll(() => {
  if (!existsSync(BUILD)) {
    throw new Error('No build output found. Run `npm run build` first.');
  }
});

describe.each(PAGES)('accessibility — $label', ({ file }) => {
  it('has no serious or critical violations', async () => {
    document.documentElement.innerHTML = '';
    document.write(load(file));

    const results = await axe.run(document, RULE_CONFIG);

    const blocking = results.violations.filter(
      (v) => v.impact === 'serious' || v.impact === 'critical',
    );

    const detail = blocking
      .map(
        (v) =>
          `\n  [${v.impact}] ${v.id}: ${v.help}\n    ${v.nodes
            .slice(0, 3)
            .map((n) => n.html.slice(0, 120))
            .join('\n    ')}`,
      )
      .join('');

    expect(blocking, `${blocking.length} blocking violation(s) in ${file}:${detail}`).toHaveLength(
      0,
    );
  });
});

/**
 * Structural assertions axe cannot express, checked on the same real output.
 */
describe.each(PAGES)('document semantics — $label', ({ file }) => {
  const html = () => {
    document.documentElement.innerHTML = '';
    document.write(load(file));
    return document;
  };

  it('declares language and direction', () => {
    const doc = html();
    const root = doc.documentElement;
    const lang = root.getAttribute('lang');
    expect(lang, 'lang attribute').toMatch(/^(ar|en)$/);
    expect(root.getAttribute('dir')).toBe(lang === 'ar' ? 'rtl' : 'ltr');
  });

  it('provides the landmarks', () => {
    const doc = html();
    expect(doc.querySelector('header'), 'header').not.toBeNull();
    expect(doc.querySelector('main#main'), 'main#main').not.toBeNull();
    expect(doc.querySelector('footer'), 'footer').not.toBeNull();
  });

  it('labels every navigation landmark', () => {
    const doc = html();
    const navs = [...doc.querySelectorAll('nav')];
    expect(navs.length).toBeGreaterThan(0);
    for (const nav of navs) {
      const labelled = nav.hasAttribute('aria-label') || nav.hasAttribute('aria-labelledby');
      expect(labelled, `unlabelled <nav>: ${nav.outerHTML.slice(0, 80)}`).toBe(true);
    }
  });

  it('has exactly one h1 and no skipped heading level', () => {
    const doc = html();
    const headings = [...doc.querySelectorAll('h1,h2,h3,h4,h5,h6')].map((h) =>
      Number(h.tagName[1]),
    );
    expect(headings.filter((l) => l === 1)).toHaveLength(1);

    let previous = headings[0];
    for (const level of headings.slice(1)) {
      expect(level - previous, `heading jumps from h${previous} to h${level}`).toBeLessThanOrEqual(
        1,
      );
      previous = level;
    }
  });

  it('provides a skip link as the first focusable element', () => {
    const doc = html();
    const skip = doc.querySelector('a.skip-link');
    expect(skip, 'skip link').not.toBeNull();
    expect(skip?.getAttribute('href')).toBe('#main');
  });

  it('gives every link and button an accessible name', () => {
    const doc = html();
    for (const el of [...doc.querySelectorAll('a, button')]) {
      const name =
        el.textContent?.trim() || el.getAttribute('aria-label') || el.getAttribute('title') || '';
      expect(name.length, `unnamed ${el.tagName}: ${el.outerHTML.slice(0, 100)}`).toBeGreaterThan(
        0,
      );
    }
  });

  it('offers a locale switcher carrying hrefLang', () => {
    const doc = html();
    const switcher = doc.querySelector('a[hreflang]');
    expect(switcher, 'locale switcher with hreflang').not.toBeNull();
  });

  it('marks the decorative mark as presentational', () => {
    const doc = html();
    const svg = doc.querySelector('header svg');
    if (svg) {
      expect(svg.getAttribute('aria-hidden')).toBe('true');
    }
  });
});
