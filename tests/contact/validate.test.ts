import { describe, expect, it } from 'vitest';
import { validateContactInput } from '@/lib/contact/validate';
import { validContent } from './helpers';

const OPTS = { allowedHosts: ['talamir.org', 'localhost'] };

describe('validateContactInput', () => {
  it('accepts a well-formed submission and normalizes whitespace', () => {
    const result = validateContactInput(validContent({ fullName: '  اسم   ممتد  ' }), OPTS);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.fullName).toBe('اسم ممتد');
      expect(result.value.consent).toBe(true);
      expect(result.value.marketingConsent).toBe(false);
    }
  });

  it('accepts a valid email in the contact field', () => {
    const result = validateContactInput(validContent({ phoneOrEmail: 'user@example.com' }), OPTS);
    expect(result.ok).toBe(true);
  });

  it('rejects a contact value that is neither email nor phone', () => {
    const result = validateContactInput(validContent({ phoneOrEmail: 'not a contact' }), OPTS);
    expect(result).toMatchObject({ ok: false, code: 'validation_failed' });
  });

  it('rejects a non-object payload', () => {
    expect(validateContactInput('nope', OPTS)).toMatchObject({
      ok: false,
      code: 'validation_failed',
    });
    expect(validateContactInput(null, OPTS)).toMatchObject({
      ok: false,
      code: 'validation_failed',
    });
    expect(validateContactInput([], OPTS)).toMatchObject({ ok: false, code: 'validation_failed' });
  });

  it('rejects an unknown field', () => {
    const result = validateContactInput(validContent({ extra: 'x' }), OPTS);
    expect(result).toMatchObject({ ok: false, code: 'unknown_field' });
  });

  it('rejects a missing required field', () => {
    const bad = validContent();
    delete (bad as Record<string, unknown>).companyName;
    expect(validateContactInput(bad, OPTS)).toMatchObject({ ok: false, code: 'validation_failed' });
  });

  it('rejects an oversized field', () => {
    const result = validateContactInput(validContent({ fullName: 'a'.repeat(200) }), OPTS);
    expect(result).toMatchObject({ ok: false, code: 'validation_failed' });
  });

  it('rejects an oversized challenge', () => {
    const result = validateContactInput(validContent({ challenge: 'x'.repeat(3000) }), OPTS);
    expect(result).toMatchObject({ ok: false, code: 'validation_failed' });
  });

  it('rejects angle brackets and javascript: schemes', () => {
    expect(validateContactInput(validContent({ city: '<b>' }), OPTS)).toMatchObject({ ok: false });
    expect(
      validateContactInput(validContent({ challenge: 'javascript:alert(1)' }), OPTS),
    ).toMatchObject({ ok: false, code: 'validation_failed' });
  });

  it('requires consent to be exactly true', () => {
    expect(validateContactInput(validContent({ consent: false }), OPTS)).toMatchObject({
      ok: false,
      code: 'invalid_consent',
    });
    expect(validateContactInput(validContent({ consent: 'true' }), OPTS)).toMatchObject({
      ok: false,
      code: 'invalid_consent',
    });
  });

  it('never infers marketing consent from inquiry consent', () => {
    const result = validateContactInput(validContent({ marketingConsent: undefined }), OPTS);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.marketingConsent).toBe(false);
  });

  it('rejects a non-boolean marketing consent', () => {
    expect(validateContactInput(validContent({ marketingConsent: 'yes' }), OPTS)).toMatchObject({
      ok: false,
      code: 'validation_failed',
    });
  });

  it('reduces an off-site page URL to its path', () => {
    const result = validateContactInput(
      validContent({ pageUrl: 'https://evil.example/track?x=1' }),
      OPTS,
    );
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.pageUrl).toBe('/track');
  });

  it('keeps a same-site page URL', () => {
    const result = validateContactInput(validContent({ pageUrl: 'https://talamir.org/en' }), OPTS);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.pageUrl).toBe('https://talamir.org/en');
  });

  it('rejects an invalid locale', () => {
    expect(validateContactInput(validContent({ locale: 'fr' }), OPTS)).toMatchObject({
      ok: false,
      code: 'validation_failed',
    });
  });
});
