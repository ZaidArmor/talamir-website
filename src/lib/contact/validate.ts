import { isLocale } from '@/lib/i18n';
import type { ContactErrorCode, ContactInput } from './types';

/**
 * Authoritative, server-side validation.
 *
 * The browser's `required` attributes are a convenience for the person filling
 * the form; they are not a security boundary and are not trusted here. This is
 * the boundary: it accepts an arbitrary parsed JSON value and only ever returns
 * a `ContactInput` that is known to be well-formed, normalized and within
 * bounds — or a safe error code explaining why it would not.
 *
 * It rejects rather than repairs. Silently dropping an unexpected field, or
 * coercing a malformed one, is how a validator drifts out of agreement with the
 * schema it is supposed to enforce.
 */

/** The exact set of fields a submission may carry — nothing else is accepted. */
const REQUIRED_TEXT = {
  fullName: 120,
  companyName: 160,
  city: 80,
  phoneOrEmail: 160,
  activityType: 80,
  interestedProduct: 80,
  timeframe: 80,
  preferredContactMethod: 80,
} as const;

const CHALLENGE_MAX = 2000;
const PAGE_URL_MAX = 512;

const ALLOWED_KEYS = new Set<string>([
  'locale',
  ...Object.keys(REQUIRED_TEXT),
  'challenge',
  'consent',
  'marketingConsent',
  'pageUrl',
]);

export type ValidationResult =
  | { ok: true; value: ContactInput }
  | { ok: false; code: ContactErrorCode };

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/**
 * Trim, collapse runs of whitespace, and strip C0/C1 control characters.
 * Newlines survive only in the challenge field, which passes `multiline`.
 */
const clean = (raw: string, multiline = false): string => {
  // Strip C0/C1 control characters. Newlines survive for multiline fields.
  // eslint-disable-next-line no-control-regex
  const controls = multiline
    ? /[\u0000-\u0009\u000B-\u001F\u007F-\u009F]/g
    : /[\u0000-\u001F\u007F-\u009F]/g;
  const stripped = raw.replace(controls, '');
  const collapsed = multiline
    ? stripped.replace(/[^\S\n]+/g, ' ').replace(/\n{3,}/g, '\n\n')
    : stripped.replace(/\s+/g, ' ');
  return collapsed.trim();
};

/** Angle brackets and `javascript:` never belong in a contact field. */
const hasDangerousMarkup = (value: string): boolean =>
  /[<>]/.test(value) || /javascript:/i.test(value);

/** Conservative — a value must look like a plausible email OR a plausible phone. */
const looksLikeEmail = (value: string): boolean =>
  value.length <= 160 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);

const looksLikePhone = (value: string): boolean => {
  const digits = value.replace(/[\s().-]/g, '');
  return /^\+?\d{7,15}$/.test(digits);
};

/**
 * Reduce the page URL to something safe to store: a same-site absolute URL is
 * kept whole; anything else is reduced to its path, so an attacker cannot use
 * this field to park an arbitrary external URL in the database.
 */
const normalizePageUrl = (raw: string, allowedHosts: string[]): string => {
  const value = clean(raw).slice(0, PAGE_URL_MAX);
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return '/';
    if (allowedHosts.includes(url.hostname)) return `${url.origin}${url.pathname}`;
    return url.pathname || '/';
  } catch {
    // Not an absolute URL — keep it only if it is a plain path.
    return value.startsWith('/') ? value : '/';
  }
};

export function validateContactInput(
  raw: unknown,
  options: { allowedHosts: string[] },
): ValidationResult {
  if (!isObject(raw)) return { ok: false, code: 'validation_failed' };

  // Any key we do not expect is a malformed or hostile payload — refuse it.
  for (const key of Object.keys(raw)) {
    if (!ALLOWED_KEYS.has(key)) return { ok: false, code: 'unknown_field' };
  }

  const locale = raw.locale;
  if (typeof locale !== 'string' || !isLocale(locale)) {
    return { ok: false, code: 'validation_failed' };
  }

  const text: Record<string, string> = {};
  for (const [field, max] of Object.entries(REQUIRED_TEXT)) {
    const value = raw[field];
    if (typeof value !== 'string') return { ok: false, code: 'validation_failed' };
    const cleaned = clean(value);
    if (cleaned.length === 0 || cleaned.length > max)
      return { ok: false, code: 'validation_failed' };
    if (hasDangerousMarkup(cleaned)) return { ok: false, code: 'validation_failed' };
    text[field] = cleaned;
  }

  if (!looksLikeEmail(text.phoneOrEmail) && !looksLikePhone(text.phoneOrEmail)) {
    return { ok: false, code: 'validation_failed' };
  }

  // Challenge is optional; empty is fine, oversized or marked-up is not.
  let challenge = '';
  if (raw.challenge !== undefined) {
    if (typeof raw.challenge !== 'string') return { ok: false, code: 'validation_failed' };
    challenge = clean(raw.challenge, true);
    if (challenge.length > CHALLENGE_MAX || hasDangerousMarkup(challenge)) {
      return { ok: false, code: 'validation_failed' };
    }
  }

  // Consent is the one field whose failure has its own code: it is a refusal to
  // proceed, not a malformed value, and the customer sees a different message.
  if (raw.consent !== true) return { ok: false, code: 'invalid_consent' };

  // Marketing consent is optional and must be an explicit boolean; it defaults
  // to false and is never inferred from the inquiry consent.
  let marketingConsent = false;
  if (raw.marketingConsent !== undefined) {
    if (typeof raw.marketingConsent !== 'boolean') return { ok: false, code: 'validation_failed' };
    marketingConsent = raw.marketingConsent;
  }

  const pageUrlRaw = typeof raw.pageUrl === 'string' ? raw.pageUrl : '/';

  return {
    ok: true,
    value: {
      locale,
      fullName: text.fullName,
      companyName: text.companyName,
      city: text.city,
      phoneOrEmail: text.phoneOrEmail,
      activityType: text.activityType,
      interestedProduct: text.interestedProduct,
      timeframe: text.timeframe,
      preferredContactMethod: text.preferredContactMethod,
      challenge,
      consent: true,
      marketingConsent,
      pageUrl: normalizePageUrl(pageUrlRaw, options.allowedHosts),
    },
  };
}
