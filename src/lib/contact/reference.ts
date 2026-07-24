import { randomBytes } from 'node:crypto';

/**
 * Public lead references.
 *
 * A reference is shown to the customer and used by the team to find the lead.
 * It must therefore be safe to say out loud and impossible to enumerate:
 *
 *   - non-sequential — it reveals nothing about how many leads exist, and one
 *     reference gives no way to guess another;
 *   - unambiguous — Crockford base32 drops I, L, O and U, so it cannot be
 *     misread over a phone call or mistyped from a screenshot;
 *   - short — 8 characters over 10 bytes of entropy is far more than enough to
 *     avoid collision at this volume, while staying easy to quote.
 *
 * The database primary key is a separate internal id; this is never it.
 */

// Crockford base32, excluding I, L, O, U.
const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

const encode = (bytes: Uint8Array, length: number): string => {
  let out = '';
  for (let i = 0; i < length; i += 1) {
    // One alphabet symbol per byte — we are buying legibility, not density.
    out += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return out;
};

/** e.g. `TAL-7F3KQ2MW`. The prefix names the source; the tail is random. */
export function newReferenceId(): string {
  return `TAL-${encode(randomBytes(8), 8)}`;
}

/** Shape check used by tests and by the store before it trusts a value. */
export const REFERENCE_PATTERN = /^TAL-[0-9A-HJKMNP-TV-Z]{8}$/;

export const isReferenceId = (value: string): boolean => REFERENCE_PATTERN.test(value);
