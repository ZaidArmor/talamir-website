import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { processContactSubmission } from '@/lib/contact/process';
import { REFERENCE_PATTERN } from '@/lib/contact/reference';
import { createRateLimiter } from '@/lib/contact/guard';
import {
  brokenStore,
  capturingMailer,
  failMailer,
  makeDeps,
  NOW,
  RECIPIENTS,
  TEST_SECRET,
  testHeaders,
  throwMailer,
  validBody,
  validToken,
} from './helpers';

/**
 * The intake orchestrator, end to end, with fake dependencies.
 *
 * This is where the load-bearing promises are asserted: success only after
 * storage, a failed email that never loses the lead, and no path that returns a
 * fabricated success.
 */

beforeEach(() => {
  process.env.CONTACT_FORM_SECRET = TEST_SECRET;
});
afterEach(() => {
  delete process.env.CONTACT_FORM_SECRET;
});

describe('successful submission', () => {
  it('accepts an Arabic submission and returns a safe reference', async () => {
    const deps = makeDeps();
    const result = await processContactSubmission(validBody({ locale: 'ar' }), testHeaders(), deps);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.referenceId).toMatch(REFERENCE_PATTERN);
      const stored = await deps.store.getByReference(result.referenceId);
      expect(stored?.status).toBe('NEW');
      expect(stored?.locale).toBe('ar');
      expect(stored?.submittedAt).toBe(new Date(NOW).toISOString());
    }
  });

  it('accepts an English submission', async () => {
    const deps = makeDeps();
    const result = await processContactSubmission(validBody({ locale: 'en' }), testHeaders(), deps);
    expect(result.success).toBe(true);
  });

  it('persists the lead and marks the notification SENT on email success', async () => {
    const { mailer, sent } = capturingMailer();
    const deps = makeDeps({ mailer });
    const result = await processContactSubmission(validBody(), testHeaders(), deps);

    expect(result.success).toBe(true);
    expect(sent).toHaveLength(1);
    if (result.success) {
      const stored = await deps.store.getByReference(result.referenceId);
      expect(stored?.notificationStatus).toBe('SENT');
      expect(stored?.notificationAttempts).toBe(1);
    }
  });
});

describe('email failure never loses the lead', () => {
  it('still succeeds and records the notification FAILED when the provider returns not-ok', async () => {
    const deps = makeDeps({ mailer: failMailer() });
    const result = await processContactSubmission(validBody(), testHeaders(), deps);

    expect(result.success).toBe(true);
    if (result.success) {
      const stored = await deps.store.getByReference(result.referenceId);
      expect(stored).not.toBeNull();
      expect(stored?.notificationStatus).toBe('FAILED');
    }
  });

  it('still succeeds when the provider throws', async () => {
    const deps = makeDeps({ mailer: throwMailer() });
    const result = await processContactSubmission(validBody(), testHeaders(), deps);
    expect(result.success).toBe(true);
    if (result.success) {
      const stored = await deps.store.getByReference(result.referenceId);
      expect(stored?.notificationStatus).toBe('FAILED');
    }
  });
});

describe('no false success', () => {
  it('fails without claiming receipt when persistence throws', async () => {
    const { mailer, sent } = capturingMailer();
    const deps = makeDeps({ store: brokenStore() as never, mailer });
    const result = await processContactSubmission(validBody(), testHeaders(), deps);

    expect(result.success).toBe(false);
    if (!result.success) expect(result.code).toBe('persistence_failed');
    // A lead that never stored must never trigger a notification.
    expect(sent).toHaveLength(0);
  });
});

describe('validation and consent', () => {
  it('rejects a missing required field', async () => {
    const deps = makeDeps();
    const result = await processContactSubmission(validBody({ city: '' }), testHeaders(), deps);
    expect(result).toMatchObject({ success: false, code: 'validation_failed' });
  });

  it('rejects when consent is not true', async () => {
    const deps = makeDeps();
    const result = await processContactSubmission(
      validBody({ consent: false }),
      testHeaders(),
      deps,
    );
    expect(result).toMatchObject({ success: false, code: 'invalid_consent' });
  });

  it('rejects an unknown field', async () => {
    const deps = makeDeps();
    const result = await processContactSubmission(
      validBody({ nickname: 'x' }),
      testHeaders(),
      deps,
    );
    expect(result).toMatchObject({ success: false, code: 'unknown_field' });
  });

  it('rejects dangerous markup', async () => {
    const deps = makeDeps();
    const result = await processContactSubmission(
      validBody({ fullName: '<script>alert(1)</script>' }),
      testHeaders(),
      deps,
    );
    expect(result).toMatchObject({ success: false, code: 'validation_failed' });
  });
});

describe('transport and abuse guards', () => {
  it('rejects an oversized body before parsing content', async () => {
    const deps = makeDeps();
    const result = await processContactSubmission(
      validBody(),
      testHeaders({ contentLength: 100_000 }),
      deps,
    );
    expect(result).toMatchObject({ success: false, code: 'payload_too_large' });
  });

  it('rejects a cross-site origin', async () => {
    const deps = makeDeps();
    const result = await processContactSubmission(
      validBody(),
      testHeaders({ origin: 'https://evil.example', referer: null, host: 'evil.example' }),
      deps,
    );
    expect(result).toMatchObject({ success: false, code: 'bad_origin' });
  });

  it('rejects a tripped honeypot without persisting', async () => {
    const deps = makeDeps();
    const result = await processContactSubmission(
      validBody({}, { _hp: 'i am a bot' }),
      testHeaders(),
      deps,
    );
    expect(result).toMatchObject({ success: false, code: 'rejected' });
  });

  it('rejects a submission that arrives implausibly fast', async () => {
    const deps = makeDeps();
    const fast = validBody({}, { formToken: validToken() });
    // Token minted 100ms ago — below the minimum completion time.
    const result = await processContactSubmission(fast, testHeaders(), {
      ...deps,
      clock: () => NOW - 4900,
    });
    expect(result).toMatchObject({ success: false, code: 'rejected' });
  });

  it('expires a stale token', async () => {
    const deps = makeDeps();
    const result = await processContactSubmission(validBody(), testHeaders(), {
      ...deps,
      // Now is far past the token's max age.
      clock: () => NOW + 3_600_000,
    });
    expect(result).toMatchObject({ success: false, code: 'expired' });
  });

  it('rate-limits repeated submissions from one client', async () => {
    const deps = makeDeps({ rateLimiter: createRateLimiter(1, 600_000) });
    const first = await processContactSubmission(validBody(), testHeaders(), deps);
    const second = await processContactSubmission(
      validBody({ fullName: 'شخص آخر' }),
      testHeaders(),
      deps,
    );
    expect(first.success).toBe(true);
    expect(second).toMatchObject({ success: false, code: 'rate_limited' });
  });

  it('dedupes an identical resubmission within the window', async () => {
    const deps = makeDeps();
    const first = await processContactSubmission(validBody(), testHeaders(), deps);
    const second = await processContactSubmission(validBody(), testHeaders(), deps);
    expect(first.success).toBe(true);
    expect(second).toMatchObject({ success: false, code: 'duplicate' });
  });
});

describe('retryable notifications', () => {
  it('lists a lead whose notification failed, then clears it on retry', async () => {
    const { retryPendingNotifications } = await import('@/lib/contact/process');
    const deps = makeDeps({ mailer: failMailer() });
    const result = await processContactSubmission(validBody(), testHeaders(), deps);
    expect(result.success).toBe(true);

    const pendingBefore = await deps.store.listPendingNotifications(10);
    expect(pendingBefore).toHaveLength(1);

    const outcome = await retryPendingNotifications(
      deps.store,
      capturingMailer().mailer,
      RECIPIENTS,
    );
    expect(outcome.sent).toBe(1);
    const pendingAfter = await deps.store.listPendingNotifications(10);
    expect(pendingAfter).toHaveLength(0);
  });
});
