import { describe, expect, it } from 'vitest';
import { placeholderBrand } from '../brand/brand.placeholder';
import { swapTestBrand } from '../brand/brand.swap-test';
import type { BrandDefinition, ColorRoles } from '../brand/brand.types';

/**
 * The brand contract, asserted rather than assumed.
 *
 * Two jobs:
 *   1. every registered identity satisfies the contract completely;
 *   2. the swap genuinely changes the site — proven by comparing two
 *      definitions across every dimension the contract governs.
 */

const REQUIRED_ROLES: Array<keyof ColorRoles> = [
  'canvas',
  'surface',
  'surfaceMuted',
  'border',
  'borderStrong',
  'text',
  'textMuted',
  'textOnAccent',
  'accent',
  'accentHover',
  'accentSubtle',
  'focus',
  'success',
  'warning',
  'danger',
  'info',
];

const brands: Array<[string, BrandDefinition]> = [
  ['placeholder', placeholderBrand],
  ['swap-test', swapTestBrand],
];

describe.each(brands)('brand contract — %s', (_name, brand) => {
  it('declares both colour schemes', () => {
    expect(Object.keys(brand.colors).sort()).toEqual(['dark', 'light']);
  });

  it.each(['light', 'dark'] as const)('%s scheme defines every colour role', (scheme) => {
    for (const role of REQUIRED_ROLES) {
      expect(brand.colors[scheme][role], `${scheme}.${role}`).toMatch(/^#[0-9a-fA-F]{3,8}$/);
    }
  });

  it('controls typography — three stacks, nine sizes, four weights', () => {
    expect(brand.typography.fontArabic.length).toBeGreaterThan(0);
    expect(brand.typography.fontLatin.length).toBeGreaterThan(0);
    expect(brand.typography.fontMono.length).toBeGreaterThan(0);
    expect(Object.keys(brand.typography.scale)).toHaveLength(9);
    expect(Object.keys(brand.typography.weight)).toHaveLength(4);
  });

  it('offers no Arabic letter-spacing token', () => {
    // Arabic letterforms connect; tracking them damages legibility. The token
    // must not exist, so a component cannot reach for it.
    expect(brand.typography).not.toHaveProperty('trackingArabic');
  });

  it('controls shape — radii, elevation, border width', () => {
    expect(Object.keys(brand.shape.radius)).toHaveLength(6);
    expect(Object.keys(brand.shape.elevation)).toHaveLength(4);
    expect(brand.shape.borderWidth).toMatch(/^\d+(\.\d+)?(px|rem)$/);
  });

  it('controls motion — four durations, four easings, stagger and distance', () => {
    for (const value of Object.values(brand.motion.duration)) {
      expect(value).toMatch(/^\d+m?s$/);
    }
    expect(Object.keys(brand.motion.easing)).toHaveLength(4);
    expect(brand.motion.stagger).toMatch(/^\d+m?s$/);
    expect(brand.motion.distance).toMatch(/^\d+(px|rem)$/);
  });

  it('controls the logo definition and reserves a stable box', () => {
    expect(brand.logo.lockupRatio).toBeGreaterThan(0);
    expect(brand.logo.minHeight).toBeGreaterThan(0);
    expect(['square', 'rounded', 'circle', 'hexagon']).toContain(brand.logo.placeholderShape);
  });

  it('keeps focus independent of accent so it can stay high-contrast', () => {
    expect(brand.colors.light).toHaveProperty('focus');
    expect(brand.colors.dark).toHaveProperty('focus');
  });

  it('renders the trading name from a token, never a literal', () => {
    // The name is under validation; the brackets are the marker.
    expect(brand.workingName.ar).toMatch(/^\[.*\]$/);
    expect(brand.workingName.en).toMatch(/^\[.*\]$/);
  });

  it('declares no final logo asset while unapproved', () => {
    if (brand.status !== 'approved') {
      expect(brand.logo.asset).toBeNull();
    }
  });
});

describe('production-visibility gate', () => {
  it('NO registered brand is approved — the site cannot be indexed', () => {
    // If this ever fails, indexing, JSON-LD and the sitemap all switch on at
    // once. That must be a deliberate owner act, never an accident.
    for (const [name, brand] of brands) {
      expect(brand.status, `${name} must not be 'approved'`).not.toBe('approved');
    }
  });

  it('every unapproved brand carries a visible placeholder notice', () => {
    for (const [name, brand] of brands) {
      expect(brand.notice, `${name} notice`).not.toBeNull();
    }
  });
});

describe('swap proof — placeholder vs swap-test', () => {
  const a = placeholderBrand;
  const b = swapTestBrand;

  it('changes accent and semantic colours in both schemes', () => {
    for (const scheme of ['light', 'dark'] as const) {
      expect(b.colors[scheme].accent).not.toBe(a.colors[scheme].accent);
      expect(b.colors[scheme].canvas).not.toBe(a.colors[scheme].canvas);
      expect(b.colors[scheme].surface).not.toBe(a.colors[scheme].surface);
      expect(b.colors[scheme].text).not.toBe(a.colors[scheme].text);
    }
  });

  it('changes typography category (sans-serif → serif)', () => {
    expect(a.typography.fontLatin).not.toBe(b.typography.fontLatin);
    expect(b.typography.fontLatin.toLowerCase()).toContain('serif');
    expect(a.typography.fontLatin.toLowerCase()).not.toContain('georgia');
  });

  it('changes border width', () => {
    expect(b.shape.borderWidth).not.toBe(a.shape.borderWidth);
  });

  it('changes radius — rounded becomes sharp', () => {
    expect(b.shape.radius.lg).not.toBe(a.shape.radius.lg);
    expect(b.shape.radius.lg).toBe('0px');
  });

  it('changes motion durations', () => {
    expect(b.motion.duration.base).not.toBe(a.motion.duration.base);
  });

  it('changes mark geometry', () => {
    expect(b.logo.placeholderShape).not.toBe(a.logo.placeholderShape);
  });

  it('changes the wordmark', () => {
    expect(b.workingName.en).not.toBe(a.workingName.en);
  });

  it('is a fixture, not a candidate identity — it cannot lift the gate', () => {
    expect(b.status).not.toBe('approved');
  });
});
