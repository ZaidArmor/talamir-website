-- 0001_contact_leads
--
-- The lead table behind POST /api/contact. Run this once against the
-- provisioned Vercel-compatible Postgres database before enabling intake.
--
-- Design notes:
--   * `id` is an internal UUID; it is never shown to anyone. `reference_id` is
--     the customer-facing, non-sequential value (see src/lib/contact/reference.ts).
--   * `status` tracks the lead; `notification_status` tracks the email, kept
--     apart so a failed email never changes the lead's own state and can be
--     retried. Neither is ever set by client input.
--   * No IP address, user agent, cookie or other browser metadata is stored —
--     the IP is used only, hashed and in memory, for rate limiting.
--   * `marketing_consent` is separate from `consent`, defaults false, and is
--     never inferred from the inquiry consent.

CREATE TABLE IF NOT EXISTS contact_leads (
  id                        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_id              text NOT NULL UNIQUE,
  locale                    text NOT NULL CHECK (locale IN ('ar', 'en')),
  full_name                 text NOT NULL,
  company_name              text NOT NULL,
  city                      text NOT NULL,
  phone_or_email            text NOT NULL,
  activity_type             text NOT NULL,
  interested_product        text NOT NULL,
  timeframe                 text NOT NULL,
  preferred_contact_method  text NOT NULL,
  challenge                 text NOT NULL DEFAULT '',
  consent                   boolean NOT NULL,
  marketing_consent         boolean NOT NULL DEFAULT false,
  source_page               text NOT NULL DEFAULT '/',
  status                    text NOT NULL DEFAULT 'NEW'
                              CHECK (status IN ('NEW', 'CONTACTED', 'QUALIFIED', 'ARCHIVED')),
  notification_status       text NOT NULL DEFAULT 'PENDING'
                              CHECK (notification_status IN ('PENDING', 'SENT', 'FAILED')),
  notification_attempts     integer NOT NULL DEFAULT 0,
  submitted_at              timestamptz NOT NULL,
  created_at                timestamptz NOT NULL DEFAULT now(),
  updated_at                timestamptz NOT NULL DEFAULT now(),
  -- Inquiry consent is a precondition, enforced at the column too.
  CONSTRAINT contact_leads_consent_required CHECK (consent = true)
);

-- The team works the newest unworked leads and retries unsent notifications.
CREATE INDEX IF NOT EXISTS contact_leads_status_created_idx
  ON contact_leads (status, created_at DESC);

CREATE INDEX IF NOT EXISTS contact_leads_notification_idx
  ON contact_leads (notification_status)
  WHERE notification_status <> 'SENT';
