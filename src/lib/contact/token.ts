import { createHmac, timingSafeEqual } from 'node:crypto';
import type { ContactErrorCode } from './types';

/**
 * The form-timing token.
 *
 * A real person takes a few seconds to fill the form; a script posts instantly,
 * and often re-posts a stale page for hours. Both are caught by binding each
 * rendered form to a server-minted, HMAC-signed timestamp and checking its age
 * on submit.
 *
 * The token is minted server-side (see `GET /api/contact`) rather than written
 * by the client, because the whole point is a timestamp the client cannot
 * forge. The signature also makes the token tamper-evident: change the time and
 * the HMAC no longer verifies. It carries no personal data and is not a session.
 */

const sign = (secret: string, payload: string): string =>
  createHmac('sha256', secret).update(payload).digest('hex');

export function mintFormToken(secret: string, nowMs: number): string {
  const ts = String(nowMs);
  return `${ts}.${sign(secret, ts)}`;
}

export type TokenResult =
  | { ok: true }
  | { ok: false; code: Extract<ContactErrorCode, 'expired' | 'rejected'> };

export function verifyFormToken(
  secret: string,
  token: unknown,
  nowMs: number,
  minMs: number,
  maxMs: number,
): TokenResult {
  if (typeof token !== 'string' || !token.includes('.')) return { ok: false, code: 'rejected' };

  const [ts, sig] = token.split('.');
  if (!/^\d{10,}$/.test(ts) || !/^[0-9a-f]{64}$/.test(sig ?? '')) {
    return { ok: false, code: 'rejected' };
  }

  const expected = sign(secret, ts);
  const a = Buffer.from(sig, 'hex');
  const b = Buffer.from(expected, 'hex');
  if (a.length !== b.length || !timingSafeEqual(a, b)) return { ok: false, code: 'rejected' };

  const age = nowMs - Number(ts);
  // Too fast is a bot; too slow is a page left open for hours — both expire.
  if (age < minMs) return { ok: false, code: 'rejected' };
  if (age > maxMs) return { ok: false, code: 'expired' };

  return { ok: true };
}
