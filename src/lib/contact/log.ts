/**
 * Safe, redacted logging for the intake pipeline.
 *
 * The rule is redaction by construction: this function accepts only a fixed set
 * of non-sensitive fields, so there is no path by which a name, a phone number,
 * an email, a message body, or a secret reaches a log line. The full submission
 * is never logged. What is logged is enough to operate and debug the endpoint —
 * an event name, the safe reference, the outcome code, and coarse counts.
 */

export interface SafeLogFields {
  event: string;
  referenceId?: string;
  locale?: string;
  code?: string;
  outcome?: 'accepted' | 'rejected' | 'error';
  notificationStatus?: string;
  /** Opaque client hash — never an IP or hostname in the clear. */
  clientKey?: string;
  durationMs?: number;
}

const ALLOWED: Array<keyof SafeLogFields> = [
  'event',
  'referenceId',
  'locale',
  'code',
  'outcome',
  'notificationStatus',
  'clientKey',
  'durationMs',
];

export function logContactEvent(fields: SafeLogFields): void {
  const safe: Record<string, unknown> = {};
  for (const key of ALLOWED) {
    const value = fields[key];
    if (value !== undefined) safe[key] = value;
  }
  // A single structured line, prefixed so it can be filtered in aggregation.
  // eslint-disable-next-line no-console
  console.info('[contact]', JSON.stringify(safe));
}
