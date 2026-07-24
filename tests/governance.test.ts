import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { basename, join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { placeholderBrand } from '../brand/brand.placeholder';
import { swapTestBrand } from '../brand/brand.swap-test';
import { talamirBrand } from '../brand/brand.talamir';
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

describe('OD-16 — the tagline is approved, and sourced from one place', () => {
  /*
   * Superseded, not deleted. OD-16 restricted the tagline to internal design
   * drafts; the owner has since approved it for the public landing page. The
   * control is re-pointed rather than removed: the tagline is now permitted,
   * but only as a brand token, and only on an identity that is itself approved.
   *
   * The original decision and its supersession are recorded in GOVERNANCE.md.
   */
  const TAGLINE = /من الفكرة إلى نظام يعمل|From idea to a system that works/i;

  it('carries the approved wording on the approved identity', () => {
    expect(talamirBrand.tagline).not.toBeNull();
    expect(talamirBrand.tagline?.ar).toMatch(TAGLINE);
    expect(talamirBrand.tagline?.en).toMatch(TAGLINE);
  });

  it('is withheld from every unapproved identity', () => {
    for (const [name, brand] of [
      ['placeholder', placeholderBrand],
      ['swap-test', swapTestBrand],
    ] as const) {
      expect(brand.tagline, `${name} must publish no tagline`).toBeNull();
    }
  });

  it('is written once — no file outside brand/ hardcodes it', () => {
    // The substance of the original control survives here: if the wording ever
    // changes, there is exactly one place to change it.
    for (const [name, body] of readAll()) {
      if (name.startsWith('/brand/')) continue;
      expect(body, `${name} hardcodes the tagline`).not.toMatch(TAGLINE);
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

describe('OD-23 — visual identity approved, still gated per identity', () => {
  /*
   * Superseded, not deleted. OD-23 deferred the visual identity, so the
   * repository shipped no mark and no typeface. The owner has since approved
   * the identity, and the landing page needs both.
   *
   * What the control actually protected still holds, one level down: an
   * identity that has NOT been approved may still register no asset, so the
   * placeholder can never quietly begin presenting itself as a finished brand.
   */
  it('registers a logo asset only on an approved identity', () => {
    // Asserted on the definitions themselves, not by scanning text — the type
    // declaration legitimately contains `asset: string | null`.
    for (const [name, brand] of [
      ['talamir', talamirBrand],
      ['placeholder', placeholderBrand],
      ['swap-test', swapTestBrand],
    ] as const) {
      if (brand.status === 'approved') {
        expect(brand.logo.asset, `${name} must register its mark`).not.toBeNull();
      } else {
        expect(brand.logo.asset, `${name} must register no logo asset`).toBeNull();
      }
    }
  });

  it('ships the registered mark as a real file', () => {
    const asset = talamirBrand.logo.asset;
    expect(asset).not.toBeNull();
    expect(
      existsSync(join(ROOT, 'public', asset!.replace(/^\//, ''))),
      `${asset} is registered but not present under public/`,
    ).toBe(true);
  });

  it('ships only openly licensed typefaces, self-hosted', () => {
    /*
     * The original control banned webfonts outright while no identity existed
     * — the risk being a licensed face committed to a repository with no
     * licence for it. That risk is addressed rather than dropped: the three
     * approved families are all SIL Open Font License 1.1, which permits
     * redistribution and web embedding, and each is named here so an
     * unlicensed face cannot arrive without this test changing.
     */
    const LICENSED = ['readex-pro', 'sora', 'ibm-plex-mono'];
    const fontLike = /\.(woff2?|ttf|otf|eot)$/i;

    // The shared `walk` filters to source extensions; fonts need their own.
    const walkAll = (dir: string): string[] =>
      readdirSync(dir).flatMap((entry) => {
        const full = join(dir, entry);
        return statSync(full).isDirectory() ? walkAll(full) : [full];
      });

    let files: string[] = [];
    try {
      files = walkAll(join(ROOT, 'public'));
    } catch {
      files = [];
    }

    const fonts = files.filter((f) => fontLike.test(f)).map((f) => basename(f));
    expect(fonts.length, 'the approved identity self-hosts its faces').toBeGreaterThan(0);

    for (const font of fonts) {
      expect(
        LICENSED.some((family) => font.startsWith(family)),
        `${font} is not one of the declared open-licensed families`,
      ).toBe(true);
    }
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

  it('references no foreign workspace, repository or package', () => {
    /*
     * Narrowed, deliberately.
     *
     * This started as a blanket ban on the string "ARMOR", written when the
     * workspace had just been split out of that repository and the only
     * appearances of the word were leftovers pointing back at it.
     *
     * The approved landing design names the car-care brand as one of the four
     * ecosystem entities, so the word is now legitimate *content*. What must
     * stay impossible is a reference to the other **workspace** — a path, a
     * repository, an import, a dependency. That is what this now checks, and
     * it is the thing the boundary actually needed protecting from.
     */
    const foreignWorkspace =
      /[A-Za-z]:[\\/]Armor|["'`][^"'`]*\.\.[\\/]{1,2}[Aa]rmor|\bgithub\.com[/:][^\s"'`]*[/]armor\b|["']armor[-/][^"']*["']\s*:/i;

    for (const [name, body] of readAll()) {
      expect(body, `${name} references a foreign workspace`).not.toMatch(foreignWorkspace);
    }
  });

  it('declares no dependency on a foreign workspace', () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    for (const [name, version] of Object.entries(deps)) {
      expect(version, `${name} resolves outside the registry`).not.toMatch(/^(file:|link:)/);
    }
  });
});
