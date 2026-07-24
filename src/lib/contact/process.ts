import type { ContactConfig } from './config';
import type { Deduper, RateLimiter } from './guard';
import { clientKey, dedupeKey, isAllowedOrigin, isHoneypotTripped } from './guard';
import { logContactEvent, type SafeLogFields } from './log';
import { buildNotificationEmail, type EmailRecipients, type Mailer } from './mailer';
import { messageFor } from './messages';
import { newReferenceId } from './reference';
import type { LeadStore } from './store';
import { verifyFormToken } from './token';
import type { Locale } from '@/content/types';
import type { ContactErrorCode, ContactResponse, NotificationStatus } from './types';
import { validateContactInput } from './validate';

/**
 * The intake orchestrator.
 *
 * A single pure function, given everything it needs as dependencies, so the
 * whole pipeline — guards, validation, persistence, notification — can be
 * exercised without a network, a database or an email provider. The route is a
 * thin adapter that builds real dependencies and calls this; the tests build
 * fake ones and call the same code.
 *
 * The contract it upholds:
 *   - success is returned only after the lead is durably stored;
 *   - a failed notification never fails the request and never loses the lead —
 *     the lead is saved, its notification marked FAILED, and retried later;
 *   - failures expose only a safe code and a localized message.
 */

export interface RequestHeaders {
  origin: string | null;
  referer: string | null;
  host: string | null;
  ip: string | null;
  contentLength: number | null;
}

export interface ProcessDeps {
  config: ContactConfig;
  store: LeadStore;
  mailer: Mailer;
  recipients: EmailRecipients;
  rateLimiter: RateLimiter;
  deduper: Deduper;
  clock: () => number;
  log?: (fields: SafeLogFields) => void;
}

const MAX_BODY_BYTES = 16 * 1024;

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/** Best-effort locale for the failure message, before validation has run. */
const localeHint = (raw: unknown): Locale => (isObject(raw) && raw.locale === 'en' ? 'en' : 'ar');

export async function processContactSubmission(
  rawBody: unknown,
  headers: RequestHeaders,
  deps: ProcessDeps,
): Promise<ContactResponse> {
  const { config, store, mailer, recipients, rateLimiter, deduper, clock } = deps;
  const log = deps.log ?? logContactEvent;
  const client = clientKey(headers.ip, headers.host);

  const fail = (
    code: ContactErrorCode,
    locale: Locale,
    outcome: 'rejected' | 'error' = 'rejected',
  ) => {
    log({ event: 'contact_submit', code, outcome, clientKey: client, locale });
    return { success: false as const, code, message: messageFor(code, locale) };
  };

  const locale = localeHint(rawBody);

  // 1 — size. Reject an oversized body before doing any work with it.
  if (headers.contentLength !== null && headers.contentLength > MAX_BODY_BYTES) {
    return fail('payload_too_large', locale);
  }
  if (!isObject(rawBody)) return fail('validation_failed', locale);

  // 2 — origin. A cross-site post from a page we did not serve is refused.
  if (!isAllowedOrigin(headers, config.allowedHosts)) return fail('bad_origin', locale);

  // Separate the transport-only fields from the content the form carries.
  const { formToken, _hp, ...content } = rawBody;

  // 3 — honeypot. A hidden field only a bot fills.
  if (isHoneypotTripped(_hp)) return fail('rejected', locale);

  // 4 — timing token. Too fast is a script; too old is a stale page.
  const token = verifyFormToken(
    process.env.CONTACT_FORM_SECRET ?? '',
    formToken,
    clock(),
    config.minFormMs,
    config.maxFormMs,
  );
  if (!token.ok) return fail(token.code, locale);

  // 5 — rate limit, per client, per instance.
  if (!rateLimiter.hit(client).allowed) return fail('rate_limited', locale);

  // 6 — validation is authoritative.
  const validated = validateContactInput(content, { allowedHosts: config.allowedHosts });
  if (!validated.ok) return fail(validated.code, locale);
  const input = validated.value;

  // 7 — dedupe a resubmission of the same enquiry within a short window.
  if (deduper.seen(dedupeKey(input))) return fail('duplicate', input.locale);

  // 8 — persist. Success is defined by this step, nothing after it.
  const referenceId = newReferenceId();
  const submittedAt = new Date(clock()).toISOString();

  let lead;
  try {
    lead = await store.create({ ...input, referenceId, submittedAt });
  } catch {
    // No provider detail escapes — only the safe code.
    return fail('persistence_failed', input.locale, 'error');
  }

  // 9 — notify. A failure here is recorded and retried, never surfaced as a
  //     failed submission and never allowed to discard the saved lead.
  let notificationStatus: NotificationStatus = 'PENDING';
  try {
    const result = await mailer.send(buildNotificationEmail(lead, recipients));
    notificationStatus = result.ok ? 'SENT' : 'FAILED';
  } catch {
    notificationStatus = 'FAILED';
  }
  try {
    await store.markNotification(referenceId, notificationStatus, 1);
  } catch {
    // Storing the notification state is best-effort; the lead is already safe.
  }

  log({
    event: 'contact_submit',
    outcome: 'accepted',
    referenceId,
    locale: input.locale,
    notificationStatus,
    clientKey: client,
  });

  return { success: true, referenceId };
}

/**
 * Safe retry of notifications that never sent. Internal — no public route calls
 * this. It can be driven by a scheduled job once intake is live.
 */
export async function retryPendingNotifications(
  store: LeadStore,
  mailer: Mailer,
  recipients: EmailRecipients,
  limit = 25,
): Promise<{ retried: number; sent: number }> {
  const pending = await store.listPendingNotifications(limit);
  let sent = 0;
  for (const lead of pending) {
    try {
      const result = await mailer.send(buildNotificationEmail(lead, recipients));
      const status: NotificationStatus = result.ok ? 'SENT' : 'FAILED';
      await store.markNotification(lead.referenceId, status, 1);
      if (result.ok) sent += 1;
    } catch {
      await store.markNotification(lead.referenceId, 'FAILED', 1);
    }
  }
  return { retried: pending.length, sent };
}
