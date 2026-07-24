import { NextResponse } from 'next/server';
import type { Locale } from '@/content/types';
import { getContactConfig, isIntakeActive } from '@/lib/contact/config';
import { createDeduper, createRateLimiter } from '@/lib/contact/guard';
import { messageFor } from '@/lib/contact/messages';
import { resolveMailer, resolveRecipients } from '@/lib/contact/mailer';
import { processContactSubmission, type ProcessDeps } from '@/lib/contact/process';
import { resolveLeadStore } from '@/lib/contact/store';
import { mintFormToken } from '@/lib/contact/token';
import type { ContactErrorCode, ContactResponse } from '@/lib/contact/types';

/**
 * The contact intake endpoint.
 *
 * GET mints a short-lived, signed form-timing token. POST processes a
 * submission. There is deliberately no route that reads, lists or returns a
 * lead — leads leave this system only by the notification email to the team.
 *
 * The endpoint is dynamic and runs on the Node runtime (it uses node:crypto and
 * a database driver). It reads all configuration at request time, so the
 * production build — which has none of it — neither fails nor bakes anything in.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// One limiter and one deduper per server instance. See guard.ts for the
// per-instance caveat and the path to a global limit later.
const rateLimiter = createRateLimiter(
  Number(process.env.CONTACT_RATE_MAX) || 5,
  Number(process.env.CONTACT_RATE_WINDOW_MS) || 10 * 60 * 1000,
);
const deduper = createDeduper(5 * 60 * 1000);

const STATUS: Record<ContactErrorCode, number> = {
  intake_unconfigured: 503,
  validation_failed: 400,
  invalid_consent: 400,
  unknown_field: 400,
  payload_too_large: 413,
  bad_origin: 400,
  rate_limited: 429,
  duplicate: 409,
  rejected: 400,
  expired: 400,
  persistence_failed: 503,
  server_error: 500,
};

const statusFor = (response: ContactResponse): number =>
  response.success ? 200 : STATUS[response.code];

const localeOf = (value: unknown): Locale =>
  typeof value === 'object' && value !== null && (value as { locale?: unknown }).locale === 'en'
    ? 'en'
    : 'ar';

const unconfigured = (locale: Locale): ContactResponse => ({
  success: false,
  code: 'intake_unconfigured',
  message: messageFor('intake_unconfigured', locale),
});

/** Builds live dependencies, or null when any part of the intake is not wired. */
function buildDeps(config: ReturnType<typeof getContactConfig>): ProcessDeps | null {
  const store = resolveLeadStore(config);
  if (!store) return null;
  const recipients = resolveRecipients();
  if (!recipients) return null;
  const mailer = resolveMailer(config.mailerConfigured);
  if (!mailer) return null;
  return { config, store, mailer, recipients, rateLimiter, deduper, clock: Date.now };
}

export async function GET(): Promise<NextResponse> {
  const config = getContactConfig();
  const secret = process.env.CONTACT_FORM_SECRET;

  // The token is only meaningful once a secret exists. Reporting `configured`
  // lets the form show the honest "being set up" state without guessing.
  if (!secret) {
    return NextResponse.json(
      { token: null, configured: false },
      { headers: { 'cache-control': 'no-store' } },
    );
  }

  return NextResponse.json(
    { token: mintFormToken(secret, Date.now()), configured: isIntakeActive(config) },
    { headers: { 'cache-control': 'no-store' } },
  );
}

export async function POST(request: Request): Promise<NextResponse> {
  const config = getContactConfig();

  // Read the body once, capping its size before parsing.
  const bytes = Number(request.headers.get('content-length')) || 0;
  const text = await request.text();
  const contentLength = bytes || Buffer.byteLength(text, 'utf8');

  let parsed: unknown = null;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {
    parsed = null;
  }
  const locale = localeOf(parsed);

  // Fail closed: if the intake is not fully wired, decline honestly. This is the
  // shipped default until the operator provisions the store, mailer and secret.
  if (!isIntakeActive(config)) {
    return NextResponse.json(unconfigured(locale), { status: 503 });
  }
  const deps = buildDeps(config);
  if (!deps) {
    return NextResponse.json(unconfigured(locale), { status: 503 });
  }

  const headers = {
    origin: request.headers.get('origin'),
    referer: request.headers.get('referer'),
    host: request.headers.get('host'),
    // Used only to derive a hashed rate-limit key — never stored. See guard.ts.
    ip:
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      request.headers.get('x-real-ip'),
    contentLength,
  };

  let response: ContactResponse;
  try {
    response = await processContactSubmission(parsed, headers, deps);
  } catch {
    response = {
      success: false,
      code: 'server_error',
      message: messageFor('server_error', locale),
    };
  }

  return NextResponse.json(response, { status: statusFor(response) });
}
