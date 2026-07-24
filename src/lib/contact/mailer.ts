import type { LeadRecord } from './types';

/**
 * Notification email.
 *
 * Like the store, the mailer is an interface. `buildNotificationEmail` is a
 * pure function that turns a persisted lead into a message; sending it is a
 * separate, injectable concern. Tests exercise the builder and a fake sender;
 * production registers a real provider adapter.
 *
 * The message carries the lead's business content and nothing operational —
 * no secret, no cookie, no authorization header, no internal identifier beyond
 * the customer-safe reference. Recipients come from the environment, never from
 * the submission.
 */

export interface EmailMessage {
  from: string;
  to: string;
  cc?: string;
  subject: string;
  text: string;
  html: string;
}

export interface Mailer {
  send(message: EmailMessage): Promise<{ ok: boolean }>;
}

export interface EmailRecipients {
  from: string;
  to: string;
  cc?: string;
}

/** Reads recipients from the environment. Returns null if any required part is missing. */
export function resolveRecipients(): EmailRecipients | null {
  const from = process.env.CONTACT_EMAIL_FROM?.trim();
  const to = process.env.CONTACT_EMAIL_TO?.trim();
  const cc = process.env.CONTACT_EMAIL_CC?.trim();
  if (!from || !to) return null;
  return cc ? { from, to, cc } : { from, to };
}

const escapeHtml = (value: string): string =>
  value.replace(
    /[&<>"]/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] as string,
  );

export function buildNotificationEmail(
  lead: LeadRecord,
  recipients: EmailRecipients,
): EmailMessage {
  const rows: Array<[string, string]> = [
    ['Reference', lead.referenceId],
    ['Submitted', lead.submittedAt],
    ['Language', lead.locale],
    ['Full name', lead.fullName],
    ['Company', lead.companyName],
    ['City', lead.city],
    ['Contact', lead.phoneOrEmail],
    ['Activity type', lead.activityType],
    ['Interested product', lead.interestedProduct],
    ['Timeframe', lead.timeframe],
    ['Preferred contact', lead.preferredContactMethod],
    ['Marketing consent', lead.marketingConsent ? 'yes' : 'no'],
    ['Source page', lead.pageUrl],
    ['Challenge', lead.challenge || '—'],
  ];

  // Email HTML is intentionally style-light: mail clients ignore CSS variables
  // and strip most CSS, so the message uses semantic markup (a heading, a
  // definition table) and no colour rather than a literal palette that could
  // never track the brand anyway.
  const subject = `TALAMIR lead ${lead.referenceId} — ${lead.companyName}`;
  const text = rows.map(([label, value]) => `${label}: ${value}`).join('\n');
  const html =
    `<h2>New TALAMIR lead — ${escapeHtml(lead.referenceId)}</h2>` +
    '<table cellpadding="6"><tbody>' +
    rows
      .map(
        ([label, value]) =>
          `<tr><th align="left" valign="top">${escapeHtml(label)}</th>` +
          `<td>${escapeHtml(value)}</td></tr>`,
      )
      .join('') +
    '</tbody></table>';

  return { ...recipients, subject, text, html };
}

/* ─────────────────────────────── resolver ───────────────────────────────── */

let mailerFactory: (() => Mailer) | null = null;

/**
 * The single wiring point for a live email provider. The production integration
 * adds one file that installs a provider SDK and calls this.
 */
export function registerMailerFactory(factory: () => Mailer): void {
  mailerFactory = factory;
}

export function resolveMailer(mailerConfigured: boolean): Mailer | null {
  if (mailerConfigured && mailerFactory) return mailerFactory();
  // Fail closed: configured recipients with no wired provider is not a mailer.
  return null;
}
