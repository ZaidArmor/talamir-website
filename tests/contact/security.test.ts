import { describe, expect, it } from 'vitest';
import { mintFormToken, verifyFormToken } from '@/lib/contact/token';
import {
  clientKey,
  createDeduper,
  createRateLimiter,
  dedupeKey,
  isAllowedOrigin,
  isHoneypotTripped,
} from '@/lib/contact/guard';
import { isReferenceId, newReferenceId, REFERENCE_PATTERN } from '@/lib/contact/reference';

const SECRET = 'a-secret';
const NOW = 1_720_000_000_000;

describe('form-timing token', () => {
  it('verifies a token of plausible age', () => {
    const token = mintFormToken(SECRET, NOW - 5000);
    expect(verifyFormToken(SECRET, token, NOW, 2500, 1_800_000)).toEqual({ ok: true });
  });

  it('rejects a token that is too fast', () => {
    const token = mintFormToken(SECRET, NOW - 100);
    expect(verifyFormToken(SECRET, token, NOW, 2500, 1_800_000)).toMatchObject({
      code: 'rejected',
    });
  });

  it('expires a token that is too old', () => {
    const token = mintFormToken(SECRET, NOW - 10_000_000);
    expect(verifyFormToken(SECRET, token, NOW, 2500, 1_800_000)).toMatchObject({ code: 'expired' });
  });

  it('rejects a tampered timestamp', () => {
    const token = mintFormToken(SECRET, NOW - 5000);
    const [, sig] = token.split('.');
    const forged = `${NOW - 6000}.${sig}`;
    expect(verifyFormToken(SECRET, forged, NOW, 2500, 1_800_000)).toMatchObject({
      code: 'rejected',
    });
  });

  it('rejects a token signed with a different secret', () => {
    const token = mintFormToken('other-secret', NOW - 5000);
    expect(verifyFormToken(SECRET, token, NOW, 2500, 1_800_000)).toMatchObject({
      code: 'rejected',
    });
  });

  it('rejects malformed tokens', () => {
    for (const bad of ['', 'nope', '123.abc', null, undefined, 42]) {
      expect(verifyFormToken(SECRET, bad, NOW, 2500, 1_800_000)).toMatchObject({
        code: 'rejected',
      });
    }
  });
});

describe('rate limiter', () => {
  it('allows up to max and blocks beyond it', () => {
    const limiter = createRateLimiter(2, 60_000);
    expect(limiter.hit('k').allowed).toBe(true);
    expect(limiter.hit('k').allowed).toBe(true);
    expect(limiter.hit('k').allowed).toBe(false);
    // A different key has its own budget.
    expect(limiter.hit('other').allowed).toBe(true);
  });
});

describe('deduper', () => {
  it('reports a repeat within the window', () => {
    const deduper = createDeduper(60_000);
    expect(deduper.seen('x')).toBe(false);
    expect(deduper.seen('x')).toBe(true);
  });

  it('derives a stable, non-reversible key', () => {
    const a = dedupeKey({ fullName: 'A', phoneOrEmail: 'p', companyName: 'C' });
    const b = dedupeKey({ fullName: 'a', phoneOrEmail: 'p', companyName: 'c' });
    expect(a).toBe(b); // case-insensitive
    expect(a).toMatch(/^[0-9a-f]{64}$/);
    expect(a).not.toContain('A');
  });

  it('hashes the client key so no IP appears in the clear', () => {
    const key = clientKey('203.0.113.9', 'talamir.org');
    expect(key).toMatch(/^[0-9a-f]{64}$/);
    expect(key).not.toContain('203.0.113.9');
  });
});

describe('origin validation', () => {
  const allowed = ['talamir.org', 'www.talamir.org', 'localhost'];

  it('accepts an allowed Origin', () => {
    expect(
      isAllowedOrigin(
        { origin: 'https://talamir.org', referer: null, host: 'talamir.org' },
        allowed,
      ),
    ).toBe(true);
  });

  it('rejects a foreign Origin', () => {
    expect(
      isAllowedOrigin(
        { origin: 'https://evil.example', referer: null, host: 'talamir.org' },
        allowed,
      ),
    ).toBe(false);
  });

  it('falls back to Host when Origin and Referer are absent', () => {
    expect(isAllowedOrigin({ origin: null, referer: null, host: 'www.talamir.org' }, allowed)).toBe(
      true,
    );
    expect(isAllowedOrigin({ origin: null, referer: null, host: 'evil.example' }, allowed)).toBe(
      false,
    );
  });
});

describe('honeypot', () => {
  it('trips on any content and ignores empty', () => {
    expect(isHoneypotTripped('anything')).toBe(true);
    expect(isHoneypotTripped('   ')).toBe(false);
    expect(isHoneypotTripped('')).toBe(false);
    expect(isHoneypotTripped(undefined)).toBe(false);
  });
});

describe('reference id safety', () => {
  it('matches the safe pattern and uses no ambiguous characters', () => {
    for (let i = 0; i < 500; i += 1) {
      const ref = newReferenceId();
      expect(ref).toMatch(REFERENCE_PATTERN);
      expect(isReferenceId(ref)).toBe(true);
      // Crockford base32 excludes I, L, O, U.
      expect(ref.slice(4)).not.toMatch(/[ILOU]/);
    }
  });

  it('is non-sequential — 1000 references collide effectively never', () => {
    const seen = new Set<string>();
    for (let i = 0; i < 1000; i += 1) seen.add(newReferenceId());
    expect(seen.size).toBe(1000);
  });
});
