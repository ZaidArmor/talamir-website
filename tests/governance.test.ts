import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { placeholderBrand } from '../brand/brand.placeholder';
import { swapTestBrand } from '../brand/brand.swap-test';
import { products } from '../src/content/products';
import { solutions, industries } from '../src/content/taxonomies';
import { posts, press, roles } from '../src/content/editorial';

/**
 * Owner-decision controls, encoded as tests.
 *
 * GOVERNANCE.md records these in prose; prose does not fail a build. These
 * assertions make the controls load-bearing, so a future edit that quietly
 * violates one stops the pipeline instead of reaching a reviewer.
 *
 * OD references are to the corporate-foundation series — see GOVERNANCE.md §6.
 */

const ROOT = process.cwd();

const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) return walk(full);
    return /\.(tsx?|css|md|json)$/.test(full) ? [full] : [];
  });

const sourceFiles = [
  ...walk(join(ROOT, 'src')),
  ...walk(join(ROOT, 'brand')),
  ...walk(join(ROOT, 'docs')),
  join(ROOT, 'README.md'),
];

const readAll = (): Array<[string, string]> =>
  sourceFiles.map((f) => [f.replace(ROOT, '').replace(/\\/g, '/'), readFileSync(f, 'utf8')]);

describe('OD-19 — name validation is not legal clearance', () => {
  it('uses no ® or ™ anywhere', () => {
    for (const [name, body] of readAll()) {
      expect(body, `${name} must not use ® or ™`).not.toMatch(/[®™]/);
    }
  });

  it('claims no trademark or company registration', () => {
    const forbidden =
      /\b(registered (trade)?mark|trademark registered|registered company|علامة مسجلة|شركة مسجلة)\b/i;
    for (const [name, body] of readAll()) {
      expect(body, `${name} must not claim registration`).not.toMatch(forbidden);
    }
  });
});

describe('OD-16 — approved tagline is blocked from public use', () => {
  it('does not publish the approved tagline', () => {
    // Approved for internal design drafts only. A public website is not that.
    const tagline = /من الفكرة إلى نظام يعمل|From idea to a system that works/i;
    for (const [name, body] of readAll()) {
      expect(body, `${name} must not carry the tagline publicly`).not.toMatch(tagline);
    }
  });
});

describe('OD-18 — SULTAN status', () => {
  const sultan = products.find((p) => p.code === 'PRD-SULTAN');

  it('is present in the portfolio', () => {
    expect(sultan).toBeDefined();
  });

  it('is labelled In Development / Demonstration Only in both locales', () => {
    expect(sultan?.lifecycleStage?.en).toBe('In Development — Demonstration Only');
    expect(sultan?.lifecycleStage?.ar).toContain('قيد التطوير');
  });

  it('makes no readiness or availability claim', () => {
    expect(sultan?.claimLevel).toBe('structural');
    expect(sultan?.capabilities).toHaveLength(0);
  });
});

describe('OD-22 — no market or research-backed positioning claims', () => {
  it('holds every product at structural claim level', () => {
    for (const product of products) {
      expect(product.claimLevel, product.slug).toBe('structural');
    }
  });

  it('publishes no entry at commercial claim level', () => {
    const all = [...products, ...solutions, ...industries, ...posts, ...roles, ...press];
    for (const entry of all) {
      expect(
        entry.state === 'published' && entry.claimLevel === 'commercial',
        `${entry.slug} is published at commercial claim level`,
      ).toBe(false);
    }
  });
});

describe('OD-23 — visual identity deferred', () => {
  it('registers no final logo asset in any brand definition', () => {
    // Asserted on the definitions themselves, not by scanning text — the type
    // declaration legitimately contains `asset: string | null`.
    for (const [name, brand] of [
      ['placeholder', placeholderBrand],
      ['swap-test', swapTestBrand],
    ] as const) {
      expect(brand.logo.asset, `${name} must register no logo asset`).toBeNull();
    }
  });

  it('ships no logo image file', () => {
    const imageLike = /\.(svg|png|jpe?g|webp|avif|ico)$/i;
    let files: string[] = [];
    try {
      files = walk(join(ROOT, 'public'));
    } catch {
      files = []; // no public/ directory — nothing can be shipped
    }
    expect(files.filter((f) => imageLike.test(f))).toHaveLength(0);
  });

  it('ships no webfont or licensed typeface file', () => {
    const fontLike = /\.(woff2?|ttf|otf|eot)$/i;
    const publicDir = join(ROOT, 'public');
    let files: string[] = [];
    try {
      files = walk(publicDir);
    } catch {
      files = []; // no public/ directory at all — also acceptable
    }
    expect(files.filter((f) => fontLike.test(f))).toHaveLength(0);
  });
});

describe('no route implies production or sales availability', () => {
  it('exposes no commerce route', () => {
    const appDir = join(ROOT, 'src', 'app');
    const routes = walk(appDir)
      .filter((f) => f.endsWith('page.tsx'))
      .map((f) => f.replace(ROOT, '').replace(/\\/g, '/'));

    const forbidden = /(pricing|checkout|cart|buy|purchase|trial|signup|sign-up|subscribe|order)/i;
    for (const route of routes) {
      expect(route, `${route} implies commerce`).not.toMatch(forbidden);
    }
  });

  it('withholds draft Solutions and Industries from production', () => {
    for (const entry of [...solutions, ...industries]) {
      expect(entry.state, `${entry.slug}`).toBe('draft');
    }
  });

  it('keeps editorial registries empty rather than fabricated', () => {
    // A press item implies real coverage; a role implies an open requisition;
    // a post implies a named author. None may be invented.
    expect(press).toHaveLength(0);
    expect(roles).toHaveLength(0);
    expect(posts).toHaveLength(0);
  });
});

describe('workspace boundary', () => {
  it('contains no absolute filesystem path to any other workspace', () => {
    const absolute = /[A-Za-z]:[\\/](?:Armor|Design|TALAMIR-RECOVERY)/i;
    for (const [name, body] of readAll()) {
      expect(body, `${name} carries an absolute path to a forbidden tree`).not.toMatch(absolute);
    }
  });

  it('makes no reference to ARMOR', () => {
    for (const [name, body] of readAll()) {
      expect(body, `${name} references ARMOR`).not.toMatch(/\bARMOR\b/);
    }
  });
});
