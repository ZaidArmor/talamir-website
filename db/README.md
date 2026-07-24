# Lead storage — environment contract and activation

The contact intake at `POST /api/contact` is **fail-closed**: it ships inert,
declining every submission with an honest "the channel is being set up" message,
and it stays that way until the owner completes the steps below. No database is
provisioned by this repository, and none was provisioned silently.

## What the owner must provision

1. **A Vercel-compatible Postgres database** (Neon via the Vercel Marketplace,
   Vercel Postgres, or Supabase all satisfy the driver contract). This is a
   paid-tier decision and is deliberately left to the owner.
2. Run [`migrations/0001_contact_leads.sql`](migrations/0001_contact_leads.sql)
   against it once.
3. **A least-privilege role** for the application: `INSERT`, `SELECT`, `UPDATE`
   on `contact_leads` only. No DDL, no other tables, no superuser.
4. **An email provider** reachable server-side from Vercel (e.g. Resend or
   Postmark) with a sending identity on the production domain.
5. Confirm the receiving mailboxes exist and accept mail **before** enabling:
   proposed `sales@talamir.org` (to) and `info@talamir.org` (cc).

## Environment variables (names only — values live in Vercel's encrypted UI)

| Name                                          | Purpose                                                     |
| --------------------------------------------- | ----------------------------------------------------------- |
| `CONTACT_INTAKE_ENABLED`                      | Master switch. Only the exact value `enabled` opens intake. |
| `CONTACT_DATABASE_URL`                        | Postgres connection string for the least-privilege role.    |
| `CONTACT_FORM_SECRET`                         | HMAC secret for the form-timing token. Long random value.   |
| `CONTACT_EMAIL_PROVIDER`                      | Provider identifier for the mailer adapter.                 |
| `CONTACT_EMAIL_API_KEY`                       | Provider API key.                                           |
| `CONTACT_EMAIL_FROM`                          | Sending identity.                                           |
| `CONTACT_EMAIL_TO`                            | Receiving mailbox (proposed: sales@talamir.org).            |
| `CONTACT_EMAIL_CC`                            | Optional copy (proposed: info@talamir.org).                 |
| `CONTACT_ALLOWED_ORIGINS`                     | Optional comma-separated host allowlist override.           |
| `CONTACT_RATE_MAX` / `CONTACT_RATE_WINDOW_MS` | Optional rate-limit tuning.                                 |
| `CONTACT_MIN_FORM_MS` / `CONTACT_MAX_FORM_MS` | Optional timing-token tuning.                               |

Never commit a value. Never echo one into a log or a build.

## The two wiring points

`src/lib/contact/store.ts` and `src/lib/contact/mailer.ts` each expose a single
registration function (`registerSqlExecutorFactory`, `registerMailerFactory`).
Activating production means adding one small integration file that installs the
chosen Postgres client and provider SDK and registers both adapters. Until both
are registered **and** every variable above is present **and** the master switch
is `enabled`, the endpoint answers `503 intake_unconfigured` — it never fakes a
success and never drops a submission silently.

The dependency additions (Postgres client, provider SDK) require license review
and owner approval per repository rules, which is why they are not preinstalled.

## Data handling

- **Stored:** exactly the form fields, the server timestamp, the reference, the
  lead status and the notification state. See the migration for the full list.
- **Not stored:** IP addresses, user agents, cookies, headers, or any browser
  metadata. The client IP is used only in-memory, hashed, for rate limiting.
- **Reading leads:** there is no public read or list endpoint, by design. Leads
  reach the team via the notification email; direct table access is an
  operator action against the database with its own credentials.
- **Retention:** leads are kept while they are commercially active. Proposed
  policy, pending owner sign-off: archive at 12 months after last update,
  delete at 24 months. Until sign-off this is a documented proposal, not an
  active claim.
