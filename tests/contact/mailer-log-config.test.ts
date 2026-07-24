import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildNotificationEmail } from '@/lib/contact/mailer';
import { logContactEvent } from '@/lib/contact/log';
import { getContactConfig, isIntakeActive } from '@/lib/contact/config';
import type { LeadRecord } from '@/lib/contact/types';
import { RECIPIENTS } from './helpers';

const record = (): LeadRecord => ({
  id: 'internal-uuid',
  referenceId: 'TAL-ABCDEFGH',
  locale: 'en',
  fullName: 'Sample Person',
  companyName: 'Sample Co',
  city: 'Riyadh',
  phoneOrEmail: '+966500000000',
  activityType: 'Company / branches',
  interestedProduct: 'SULTAN',
  timeframe: 'Exploring',
  preferredContactMethod: 'Call',
  challenge: 'Scattered operations',
  consent: true,
  marketingConsent: false,
  pageUrl: 'https://talamir.org/en',
  status: 'NEW',
  notificationStatus: 'PENDING',
  notificationAttempts: 0,
  submittedAt: '2026-07-24T00:00:00.000Z',
  createdAt: '2026-07-24T00:00:00.000Z',
  updatedAt: '2026-07-24T00:00:00.000Z',
});

describe('notification email', () => {
  it('contains every required lead field', () => {
    const message = buildNotificationEmail(record(), RECIPIENTS);
    for (const needle of [
      'TAL-ABCDEFGH',
      '2026-07-24',
      'en',
      'Sample Person',
      'Sample Co',
      'Riyadh',
      '+966500000000',
      'Company / branches',
      'SULTAN',
      'Exploring',
      'Call',
      'Scattered operations',
      'talamir.org/en',
    ]) {
      expect(message.text).toContain(needle);
    }
    expect(message.to).toBe(RECIPIENTS.to);
    expect(message.cc).toBe(RECIPIENTS.cc);
  });

  it('carries no secret, cookie, authorization header or internal id', () => {
    const message = buildNotificationEmail(record(), RECIPIENTS);
    const blob = `${message.subject}\n${message.text}\n${message.html}`.toLowerCase();
    expect(blob).not.toContain('internal-uuid');
    expect(blob).not.toContain('authorization');
    expect(blob).not.toContain('cookie');
    expect(blob).not.toContain('api_key');
    expect(blob).not.toContain('secret');
  });

  it('escapes markup in the HTML body', () => {
    const withMarkup = { ...record(), companyName: 'A & B <Co>' };
    const message = buildNotificationEmail(withMarkup, RECIPIENTS);
    expect(message.html).toContain('A &amp; B &lt;Co&gt;');
    expect(message.html).not.toContain('<Co>');
  });
});

describe('redacted logging', () => {
  it('logs only whitelisted fields — never form values', () => {
    const spy = vi.spyOn(console, 'info').mockImplementation(() => {});
    logContactEvent({
      event: 'contact_submit',
      outcome: 'accepted',
      referenceId: 'TAL-ABCDEFGH',
      locale: 'ar',
      notificationStatus: 'SENT',
      clientKey: 'deadbeef',
      // @ts-expect-error — a stray sensitive field must be dropped, not logged.
      fullName: 'Sample Person',
      phoneOrEmail: '+966500000000',
    });
    const line = spy.mock.calls[0].join(' ');
    expect(line).toContain('TAL-ABCDEFGH');
    expect(line).not.toContain('Sample Person');
    expect(line).not.toContain('+966500000000');
    spy.mockRestore();
  });
});

describe('intake configuration gate', () => {
  const saved = { ...process.env };
  beforeEach(() => {
    for (const key of Object.keys(process.env)) {
      if (key.startsWith('CONTACT_')) delete process.env[key];
    }
  });
  afterEach(() => {
    process.env = { ...saved };
  });

  it('is inactive by default (fail closed)', () => {
    expect(isIntakeActive(getContactConfig())).toBe(false);
  });

  it('requires every part before it is active', () => {
    process.env.CONTACT_INTAKE_ENABLED = 'enabled';
    process.env.CONTACT_DATABASE_URL = 'postgres://x';
    process.env.CONTACT_FORM_SECRET = 's';
    // Mailer still missing → inactive.
    expect(isIntakeActive(getContactConfig())).toBe(false);

    process.env.CONTACT_EMAIL_PROVIDER = 'p';
    process.env.CONTACT_EMAIL_API_KEY = 'k';
    process.env.CONTACT_EMAIL_FROM = 'noreply@talamir.org';
    process.env.CONTACT_EMAIL_TO = 'sales@talamir.org';
    expect(isIntakeActive(getContactConfig())).toBe(true);
  });

  it('stays inactive if the switch is anything other than `enabled`', () => {
    process.env.CONTACT_INTAKE_ENABLED = 'true';
    process.env.CONTACT_DATABASE_URL = 'postgres://x';
    process.env.CONTACT_FORM_SECRET = 's';
    process.env.CONTACT_EMAIL_PROVIDER = 'p';
    process.env.CONTACT_EMAIL_API_KEY = 'k';
    process.env.CONTACT_EMAIL_FROM = 'noreply@talamir.org';
    process.env.CONTACT_EMAIL_TO = 'sales@talamir.org';
    expect(isIntakeActive(getContactConfig())).toBe(false);
  });

  it('does not expose any secret value on the config object', () => {
    // Synthetic values on a reserved host — never a real connection string.
    process.env.CONTACT_DATABASE_URL = 'postgres://user:pw@example.invalid/db';
    process.env.CONTACT_EMAIL_API_KEY = 'not-a-real-key-value';
    const config = getContactConfig();
    const serialized = JSON.stringify(config);
    expect(serialized).not.toContain('not-a-real-key-value');
    expect(serialized).not.toContain('example.invalid');
  });
});
