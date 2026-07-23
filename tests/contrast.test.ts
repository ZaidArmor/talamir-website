import { describe, expect, it } from 'vitest';
import { placeholderBrand } from '../brand/brand.placeholder';
import { swapTestBrand } from '../brand/brand.swap-test';
import type { BrandDefinition, ColorRoles } from '../brand/brand.types';
import { ratio } from './helpers/contrast';

/**
 * Closes the contrast gap recorded in docs/06 §6.9.
 *
 * The brand contract *documents* a contrast requirement; until now nothing
 * enforced it, so a candidate identity could have shipped failing contrast and
 * no gate would have caught it. These tests assert it on the tokens themselves,
 * for **every** registered brand and **both** schemes.
 *
 * Token-level assertion is deliberate and is stronger than a rendered check
 * here: it catches a bad palette the moment it is written, before any page uses
 * it, and it cannot be fooled by a component that happens not to render a
 * particular pair yet.
 *
 * Thresholds (WCAG 2.1 AA):
 *   4.5:1  normal body text
 *   3.0:1  large text and non-text UI (borders, focus indicators)
 */

const AA_TEXT = 4.5;
const AA_LARGE_OR_UI = 3.0;

/** Text-on-background pairs that must satisfy 4.5:1. */
const textPairs: Array<[keyof ColorRoles, keyof ColorRoles]> = [
  ['text', 'canvas'],
  ['text', 'surface'],
  ['text', 'surfaceMuted'],
  ['textMuted', 'canvas'],
  ['textMuted', 'surface'],
  ['textMuted', 'surfaceMuted'],
  ['textOnAccent', 'accent'],
  // Status colours are used as text on the page background.
  ['success', 'canvas'],
  ['warning', 'canvas'],
  ['danger', 'canvas'],
  ['info', 'canvas'],
  // The accent is used for links and for the active-tab label.
  ['accent', 'canvas'],
  ['accent', 'surface'],
  // Accent text on its own subtle wash (badges).
  ['accent', 'accentSubtle'],
];

/** Non-text UI pairs that must satisfy 3:1. */
const uiPairs: Array<[keyof ColorRoles, keyof ColorRoles]> = [
  ['borderStrong', 'canvas'],
  ['borderStrong', 'surface'],
  ['borderStrong', 'surfaceMuted'],
  ['focus', 'canvas'],
  ['focus', 'surface'],
  ['accent', 'canvas'],
];

const brands: Array<[string, BrandDefinition]> = [
  ['placeholder', placeholderBrand],
  ['swap-test', swapTestBrand],
];

describe.each(brands)('contrast — %s brand', (_name, brand) => {
  describe.each(['light', 'dark'] as const)('%s scheme', (scheme) => {
    const roles = brand.colors[scheme];

    it.each(textPairs)('%s on %s meets 4.5:1', (fg, bg) => {
      const value = ratio(roles[fg], roles[bg]);
      expect(
        value,
        `${fg} (${roles[fg]}) on ${bg} (${roles[bg]}) = ${value}:1, need >= ${AA_TEXT}`,
      ).toBeGreaterThanOrEqual(AA_TEXT);
    });

    it.each(uiPairs)('%s against %s meets 3:1', (fg, bg) => {
      const value = ratio(roles[fg], roles[bg]);
      expect(
        value,
        `${fg} (${roles[fg]}) against ${bg} (${roles[bg]}) = ${value}:1, need >= ${AA_LARGE_OR_UI}`,
      ).toBeGreaterThanOrEqual(AA_LARGE_OR_UI);
    });
  });
});

describe('contrast helper', () => {
  it('computes the reference black/white ratio as 21:1', () => {
    expect(ratio('#000000', '#ffffff')).toBe(21);
  });

  it('is symmetric', () => {
    expect(ratio('#123456', '#abcdef')).toBe(ratio('#abcdef', '#123456'));
  });

  it('rejects a value it cannot interpret rather than scoring it silently', () => {
    // A future identity using oklch() must fail loudly here, not pass by
    // accident — that is the signal to extend the checker, not to skip it.
    expect(() => ratio('oklch(0.7 0.1 200)', '#ffffff')).toThrow();
  });
});
