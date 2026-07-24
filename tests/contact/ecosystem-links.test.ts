import { describe, expect, it } from 'vitest';
import { ecosystem, entityById } from '@/content/landing/ecosystem';

/**
 * The ecosystem links, asserted at the data level.
 *
 * Attributes and keyboard behaviour of the rendered link are covered in
 * `tests/dom/external-cta.test.tsx`; this file pins the *destinations*: the one
 * approved external URL, and the absence of any invented one.
 */

describe('ARMOR external link', () => {
  const armor = entityById('car-care');

  it('points at the approved destination', () => {
    expect(armor?.external?.href).toBe('https://armor.sa');
  });

  it('carries the approved bilingual accessible labels', () => {
    expect(armor?.external?.label.ar).toBe('زيارة موقع أرمور للعناية وحماية السيارات');
    expect(armor?.external?.label.en).toBe('Visit the ARMOR Car Care website');
  });

  it('is the operating brand, so the link reads as live', () => {
    expect(armor?.status).toBe('operating');
  });
});

describe('other ecosystem entities have intentional destinations', () => {
  it('invents no external URL — only ARMOR has one', () => {
    const withExternal = ecosystem.filter((e) => e.external);
    expect(withExternal.map((e) => e.id)).toEqual(['car-care']);
  });

  it('declares no placeholder or dead link on any entity', () => {
    for (const entity of ecosystem) {
      const href = entity.external?.href;
      if (href) {
        expect(href).toMatch(/^https:\/\//);
        expect(href).not.toBe('#');
      }
    }
  });
});
