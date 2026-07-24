import type { ContactConfig } from '@/lib/contact/config';
import { createDeduper, createRateLimiter } from '@/lib/contact/guard';
import type { EmailMessage, Mailer } from '@/lib/contact/mailer';
import type { ProcessDeps, RequestHeaders } from '@/lib/contact/process';
import { MemoryLeadStore } from '@/lib/contact/store';
import { mintFormToken } from '@/lib/contact/token';

/**
 * Shared, synthetic fixtures for the contact tests.
 *
 * No real personal data and no real email is ever produced. The valid contact
 * uses a phone number in a reserved test range; recipients use role/noreply
 * addresses only; and no test sends anything over a network.
 */

export const TEST_SECRET = 'test-secret-value-not-real';
export const NOW = 1_720_000_000_000; // fixed clock, ms

export const RECIPIENTS = {
  from: 'noreply@talamir.org',
  to: 'sales@talamir.org',
  cc: 'info@talamir.org',
};

export const testConfig = (overrides: Partial<ContactConfig> = {}): ContactConfig => ({
  enabledFlag: true,
  storeConfigured: true,
  mailerConfigured: true,
  formSecretPresent: true,
  allowedHosts: ['talamir.org', 'www.talamir.org', 'localhost'],
  rateMax: 5,
  rateWindowMs: 600_000,
  minFormMs: 2500,
  maxFormMs: 1_800_000,
  ...overrides,
});

/** A form-timing token minted 5s before NOW — inside the valid window. */
export const validToken = (secret = TEST_SECRET): string => mintFormToken(secret, NOW - 5000);

export const validContent = (overrides: Record<string, unknown> = {}): Record<string, unknown> => ({
  locale: 'ar',
  fullName: 'اسم تجريبي',
  companyName: 'شركة تجريبية',
  city: 'الرياض',
  // A phone, not an email — keeps every fixture free of a real-looking address.
  phoneOrEmail: '+966500000000',
  activityType: 'شركة / فروع',
  interestedProduct: 'سلطان',
  timeframe: 'أستكشف',
  preferredContactMethod: 'اتصال',
  challenge: '',
  consent: true,
  marketingConsent: false,
  pageUrl: 'https://talamir.org/ar',
  ...overrides,
});

/** A full raw body, as the route would hand it to the processor. */
export const validBody = (
  contentOverrides: Record<string, unknown> = {},
  meta: { formToken?: unknown; _hp?: unknown } = {},
): Record<string, unknown> => ({
  ...validContent(contentOverrides),
  formToken: 'formToken' in meta ? meta.formToken : validToken(),
  _hp: '_hp' in meta ? meta._hp : '',
});

export const testHeaders = (overrides: Partial<RequestHeaders> = {}): RequestHeaders => ({
  origin: 'https://talamir.org',
  referer: null,
  host: 'talamir.org',
  ip: '203.0.113.9',
  contentLength: 600,
  ...overrides,
});

export const okMailer = (): Mailer => ({ send: async () => ({ ok: true }) });
export const failMailer = (): Mailer => ({ send: async () => ({ ok: false }) });
export const throwMailer = (): Mailer => ({
  send: async () => {
    throw new Error('provider unreachable');
  },
});

export const capturingMailer = (): { mailer: Mailer; sent: EmailMessage[] } => {
  const sent: EmailMessage[] = [];
  return {
    sent,
    mailer: {
      send: async (message) => {
        sent.push(message);
        return { ok: true };
      },
    },
  };
};

/** A store whose create() always fails, for the persistence-failure path. */
export const brokenStore = () => ({
  create: async () => {
    throw new Error('db unreachable');
  },
  markNotification: async () => {},
  getByReference: async () => null,
  listPendingNotifications: async () => [],
});

export interface BuiltDeps extends ProcessDeps {
  store: MemoryLeadStore;
}

export const makeDeps = (overrides: Partial<ProcessDeps> = {}): BuiltDeps => {
  const store = new MemoryLeadStore();
  return {
    config: testConfig(),
    store,
    mailer: okMailer(),
    recipients: RECIPIENTS,
    rateLimiter: createRateLimiter(5, 600_000),
    deduper: createDeduper(300_000),
    clock: () => NOW,
    log: () => {},
    ...overrides,
    // Ensure the concrete MemoryLeadStore type is returned unless overridden.
    ...(overrides.store ? {} : { store }),
  } as BuiltDeps;
};
