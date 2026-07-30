import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Mobile viewport integrity.
 *
 * ── the bug this suite exists to prevent ──────────────────────────────────
 *
 * The enquiry form's honeypot was hidden with `position: absolute; left:
 * -9999px`. That element has no positioned ancestor, so its containing block is
 * the initial containing block — it escapes the `overflow-x: clip` on `.lp`
 * entirely.
 *
 * In LTR that is invisible: overflow past the inline start is not scrollable.
 * In RTL the scroll origin is the right edge, so the identical declaration
 * became 9999px of *real* scrollable overflow. Measured on /ar at 390px wide:
 * `documentElement.scrollWidth` 10389 against a `clientWidth` of 390. The page
 * could be panned sideways, which on a phone reads as scrolling being broken.
 * /en measured 0px of overflow, which is why the fault looked intermittent.
 *
 * ── why these are source assertions ───────────────────────────────────────
 *
 * The real proof is a layout measurement, and jsdom performs no layout: it
 * reports 0 for every `scrollWidth`, so a jsdom assertion here would pass
 * whether or not the bug is present. Rather than pretend, this suite locks the
 * *cause* — the CSS declarations and the guards in the motion components — and
 * the viewport sweep across 360/375/390/412/430/768 is run in a real engine.
 * Adding a browser driver to the dependency tree for it was not authorised.
 */

const ROOT = process.cwd();
const landingCss = readFileSync(join(ROOT, 'src', 'styles', 'landing.css'), 'utf8');
const globalsCss = readFileSync(join(ROOT, 'src', 'styles', 'globals.css'), 'utf8');

/**
 * Declarations only, with comment blocks removed.
 *
 * The rule below documents the offending declaration verbatim so the next
 * reader understands why it is banned — which a naive text scan then reports as
 * a violation of itself.
 */
const declarationsOnly = (css: string): string => css.replace(/\/\*[\s\S]*?\*\//g, '');

/** Grabs the body of the first rule whose selector list matches. */
const ruleBody = (css: string, selector: string): string => {
  const index = css.indexOf(selector);
  if (index === -1) return '';
  const open = css.indexOf('{', index);
  const close = css.indexOf('}', open);
  return open === -1 || close === -1 ? '' : css.slice(open + 1, close);
};

describe('horizontal overflow — no element may widen the document', () => {
  it('the honeypot is clipped in place, not parked off-screen', () => {
    const body = ruleBody(landingCss, '.lp-hp {');
    expect(body).not.toBe('');

    // The clip-rect pattern: occupies a 1px box at the inline start.
    expect(body).toMatch(/clip-path:\s*inset\(50%\)/);
    expect(body).toMatch(/width:\s*1px/);
    expect(body).toMatch(/height:\s*1px/);
    expect(body).toMatch(/overflow:\s*hidden/);

    // And specifically not the mechanism that caused the fault.
    expect(body).not.toMatch(/left:\s*-/);
    expect(body).not.toMatch(/right:\s*-/);
    expect(body).not.toMatch(/translate/);
  });

  it('no rule anywhere parks an element a thousand pixels or more off-axis', () => {
    // A general invariant, not just for `.lp-hp`: any large offset on an
    // absolutely-positioned element is one RTL page away from being scrollable.
    const scan = (css: string) =>
      [
        ...declarationsOnly(css).matchAll(
          /(left|right|inset-inline-start|inset-inline-end)\s*:\s*(-?\d+)px/g,
        ),
      ]
        .filter((match) => Math.abs(Number(match[2])) >= 1000)
        .map((match) => match[0]);

    expect(scan(landingCss)).toEqual([]);
    expect(scan(globalsCss)).toEqual([]);
  });

  it('html and body carry the overflow backstop', () => {
    const body = ruleBody(globalsCss, 'html,\n  body {');
    expect(body).toMatch(/max-width:\s*100%/);
    expect(body).toMatch(/overflow-x:\s*clip/);
  });

  it('uses overflow-x: clip, never hidden, so sticky and anchors survive', () => {
    // `overflow-x: hidden` on the root makes it a scroll container, which breaks
    // `position: sticky` descendants and anchor scrolling. `clip` does not.
    expect(globalsCss).not.toMatch(/^\s*overflow-x:\s*hidden/m);
    expect(landingCss).not.toMatch(/^\s*overflow-x:\s*hidden/m);
  });
});

describe('preloader cannot outlive its welcome', () => {
  it('the finished state is inert, not merely invisible', () => {
    const body = ruleBody(landingCss, ".lp-preloader[data-state='done'] {");
    expect(body).not.toBe('');
    expect(body).toMatch(/opacity:\s*0/);
    expect(body).toMatch(/visibility:\s*hidden/);
    expect(body).toMatch(/pointer-events:\s*none\s*!important/);
  });

  it('the keyframe end state is also inert', () => {
    const body = ruleBody(landingCss, '@keyframes lp-preloader-out');
    expect(body).toMatch(/pointer-events:\s*none/);
  });

  it('is not gated on [aria-hidden], which is static in the markup', () => {
    // The overlay is decoratively `aria-hidden` from the first frame, so an
    // `[aria-hidden='true']` selector would hide it before it ever showed.
    expect(landingCss).not.toMatch(/\.lp-preloader\[aria-hidden/);
  });

  it('still retires itself with CSS alone, with no JavaScript required', () => {
    const body = ruleBody(landingCss, '.lp-preloader {');
    expect(body).toMatch(/animation:\s*lp-preloader-out/);
    expect(body).toMatch(/forwards/);
  });

  it('is released by a bounded deadline measured from navigation start', () => {
    const source = readFileSync(
      join(ROOT, 'src', 'components', 'landing', 'PreloaderRelease.tsx'),
      'utf8',
    );
    expect(source).toMatch(/RELEASE_DEADLINE_MS\s*=\s*1500/);
    // All four triggers the release must answer to.
    expect(source).toMatch(/'DOMContentLoaded'/);
    expect(source).toMatch(/'load'/);
    expect(source).toMatch(/'pageshow'/);
    expect(source).toMatch(/setTimeout/);
    // Measured from navigation start, not from mount — hydration can land well
    // after 1500ms on a slow phone.
    expect(source).toMatch(/performance\.now\(\)/);
    // Every listener and the timer are torn down.
    expect(source).toMatch(/clearTimeout/);
    expect((source.match(/removeEventListener/g) ?? []).length).toBe(3);
  });

  it('is wired into the landing page', () => {
    const page = readFileSync(
      join(ROOT, 'src', 'components', 'landing', 'LandingPage.tsx'),
      'utf8',
    );
    expect(page).toMatch(/import \{ PreloaderRelease \}/);
    expect(page).toMatch(/<PreloaderRelease \/>/);
  });

  it('is removed outright under prefers-reduced-motion', () => {
    const reduced = landingCss.slice(landingCss.indexOf('@media (prefers-reduced-motion: reduce)'));
    expect(reduced).toMatch(/\.lp-preloader\s*\{\s*display:\s*none\s*!important/);
  });
});

describe('touch-device motion guards', () => {
  it('the hero parallax never binds a pointer listener on a coarse pointer', () => {
    const source = readFileSync(join(ROOT, 'src', 'components', 'landing', 'Orbit.tsx'), 'utf8');
    expect(source).toMatch(/\(pointer:\s*fine\)/);
    expect(source).toMatch(/prefers-reduced-motion/);
    // The guard must return *before* the listener is attached.
    const guard = source.indexOf('if (reduced || !finePointer) return');
    const attach = source.indexOf('addEventListener');
    expect(guard).toBeGreaterThan(-1);
    expect(guard).toBeLessThan(attach);
    expect(source).toMatch(/removeEventListener/);
  });

  it('the scroll reveal runs once, then releases the element', () => {
    const source = readFileSync(join(ROOT, 'src', 'components', 'landing', 'Reveal.tsx'), 'utf8');
    expect(source).toMatch(/observer\.disconnect\(\)/);
    expect(source).toMatch(/prefers-reduced-motion/);
    // A shared listener pair for the whole page, throttled through one rAF.
    expect(source).toMatch(/requestAnimationFrame/);
    expect(source).toMatch(/\{ passive: true \}/);
  });

  it('no handler blocks native touch scrolling', () => {
    for (const file of ['Orbit.tsx', 'Reveal.tsx', 'LandingHeader.tsx', 'LandingPage.tsx']) {
      const source = readFileSync(join(ROOT, 'src', 'components', 'landing', file), 'utf8');
      expect(source).not.toMatch(/touchmove/);
      expect(source).not.toMatch(/preventDefault/);
    }
  });
});

describe('mobile drawer leaves no scroll lock behind', () => {
  it('never writes overflow, position or touch-action onto html or body', () => {
    const source = readFileSync(
      join(ROOT, 'src', 'components', 'landing', 'LandingHeader.tsx'),
      'utf8',
    );
    // The drawer is a `pointer-events` layer, not a scroll lock. If that ever
    // changes, the restore-on-close path needs its own test.
    expect(source).not.toMatch(/document\.body\.style/);
    expect(source).not.toMatch(/documentElement\.style/);
    expect(source).not.toMatch(/overflow\s*=/);
  });

  it('the closed drawer is inert and starts closed', () => {
    const source = readFileSync(
      join(ROOT, 'src', 'components', 'landing', 'LandingHeader.tsx'),
      'utf8',
    );
    expect(source).toMatch(/useState\(false\)/);
    expect(source).toMatch(/data-open=\{open\}/);
    // Closing paths: link tap and Escape.
    expect(source).toMatch(/onClick=\{\(\) => setOpen\(false\)\}/);
    expect(source).toMatch(/'Escape'/);

    const closed = ruleBody(landingCss, '.lp-nav {\n    position: fixed;');
    expect(closed).toMatch(/pointer-events:\s*none/);
    const open = ruleBody(landingCss, ".lp-nav[data-open='true'] {");
    expect(open).toMatch(/pointer-events:\s*auto/);
  });
});

/**
 * The prerendered-HTML half. Skipped rather than failed when there is no build,
 * so `npm test` stays runnable on its own; `closure:verify` runs build first.
 */
const BUILD = join(ROOT, '.next', 'server', 'app');
const built = existsSync(join(BUILD, 'ar.html'));

describe.skipIf(!built)('prerendered markup', () => {
  const pages = ['ar.html', 'en.html'].map((file) => ({
    file,
    html: readFileSync(join(BUILD, file), 'utf8'),
  }));

  it('ships the drawer closed in the HTML, before any JavaScript runs', () => {
    for (const { file, html } of pages) {
      expect(html, file).toMatch(/data-open="false"/);
      expect(html, file).not.toMatch(/data-open="true"/);
    }
  });

  it('ships the honeypot present and fillable', () => {
    for (const { file, html } of pages) {
      expect(html, file).toMatch(/class="lp-hp"/);
      expect(html, file).toMatch(/name="_hp"/);
    }
  });

  it('ships the preloader with no done-state baked in, so it is still shown', () => {
    for (const { file, html } of pages) {
      expect(html, file).toMatch(/class="lp-preloader"/);
      expect(html, file).not.toMatch(/lp-preloader"[^>]*data-state="done"/);
    }
  });

  it('carries every section the header links to', () => {
    for (const { file, html } of pages) {
      for (const id of ['hero', 'ecosystem', 'buy', 'sell', 'fit', 'activity', 'faq', 'contact']) {
        expect(html, `${file} — #${id}`).toMatch(new RegExp(`id="${id}"`));
      }
    }
  });
});
