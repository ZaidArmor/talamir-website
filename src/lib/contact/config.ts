import 'server-only';

/**
 * Contact-intake configuration, read from the environment.
 *
 * Every value here is read lazily, at request time, from `process.env` — never
 * at module load — so the production build (which has none of these set) neither
 * fails nor bakes a stale value in. Nothing in this file returns a secret; it
 * reports only whether a secret is *present*, and the non-sensitive settings.
 *
 * The intake is a fail-closed system. `intakeActive` is true only when the
 * operator has deliberately enabled it AND a lead store AND a mailer AND the
 * form-timing secret are all configured. Any gap keeps the endpoint in its
 * shipped state: politely declining, telling the visitor the channel is being
 * set up, and never claiming to have received anything.
 */

export interface ContactConfig {
  /** The master switch. `enabled` and nothing else turns intake on. */
  enabledFlag: boolean;
  /** Whether a lead-store connection string is present. */
  storeConfigured: boolean;
  /** Whether an email provider + key + from + to are all present. */
  mailerConfigured: boolean;
  /** Whether the HMAC secret for the form-timing token is present. */
  formSecretPresent: boolean;
  /** Hosts a submission may originate from. */
  allowedHosts: string[];
  /** Fixed-window rate limit. */
  rateMax: number;
  rateWindowMs: number;
  /** Minimum and maximum age of a valid form-timing token. */
  minFormMs: number;
  maxFormMs: number;
}

const bool = (value: string | undefined, on: string): boolean => value === on;

const present = (value: string | undefined): boolean =>
  typeof value === 'string' && value.trim().length > 0;

const num = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export function getContactConfig(): ContactConfig {
  const env = process.env;

  const allowedHosts = present(env.CONTACT_ALLOWED_ORIGINS)
    ? env
        .CONTACT_ALLOWED_ORIGINS!.split(',')
        .map((host) => host.trim().toLowerCase())
        .filter(Boolean)
    : ['talamir.org', 'www.talamir.org', 'localhost', '127.0.0.1'];

  return {
    enabledFlag: bool(env.CONTACT_INTAKE_ENABLED, 'enabled'),
    storeConfigured: present(env.CONTACT_DATABASE_URL) || present(env.POSTGRES_URL),
    mailerConfigured:
      present(env.CONTACT_EMAIL_PROVIDER) &&
      present(env.CONTACT_EMAIL_API_KEY) &&
      present(env.CONTACT_EMAIL_FROM) &&
      present(env.CONTACT_EMAIL_TO),
    formSecretPresent: present(env.CONTACT_FORM_SECRET),
    allowedHosts,
    rateMax: num(env.CONTACT_RATE_MAX, 5),
    rateWindowMs: num(env.CONTACT_RATE_WINDOW_MS, 10 * 60 * 1000),
    minFormMs: num(env.CONTACT_MIN_FORM_MS, 2500),
    maxFormMs: num(env.CONTACT_MAX_FORM_MS, 30 * 60 * 1000),
  };
}

/**
 * The single gate. Everything must line up, or the intake stays closed.
 *
 * `storeConfigured` reports the *connection string*, but a live store also
 * needs its driver wired (see `store.ts`). The store resolver is the final
 * authority — this flag is the operator-facing summary.
 */
export function isIntakeActive(config: ContactConfig): boolean {
  return (
    config.enabledFlag &&
    config.storeConfigured &&
    config.mailerConfigured &&
    config.formSecretPresent
  );
}
