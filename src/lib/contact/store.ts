import { randomUUID } from 'node:crypto';
import type { LeadRecord, NewLead, NotificationStatus } from './types';
import type { ContactConfig } from './config';

/**
 * Lead storage.
 *
 * The store is an interface, not a database. The pipeline depends only on this
 * contract, which is what lets the whole flow be tested against an in-memory
 * implementation while the production driver is a separate, swappable concern.
 *
 * Three implementations exist here:
 *   - `MemoryLeadStore`  — durable only for the life of the process. Tests use
 *     it; production must never resolve to it.
 *   - `PostgresLeadStore` — the real, parameterized SQL implementation, written
 *     against a minimal `SqlExecutor` so it carries no database dependency of
 *     its own. It is ready; it is not yet wired to a live client.
 *   - the resolver below, which is fail-closed: unless a memory store is
 *     explicitly permitted, or an executor factory has been registered, it
 *     returns `null` and the endpoint stays closed.
 *
 * Wiring production is the documented final step (see `db/README.md`): install
 * a Vercel-compatible Postgres client, and register a factory that adapts it to
 * `SqlExecutor`. No code in this file changes.
 */

export interface LeadStore {
  create(lead: NewLead): Promise<LeadRecord>;
  markNotification(
    referenceId: string,
    status: NotificationStatus,
    attemptDelta: number,
  ): Promise<void>;
  /** Internal only. No public route exposes this. */
  getByReference(referenceId: string): Promise<LeadRecord | null>;
  /** Internal only. Powers safe retry of failed notifications. */
  listPendingNotifications(limit: number): Promise<LeadRecord[]>;
}

/** The narrow SQL surface `PostgresLeadStore` needs. Any driver can satisfy it. */
export interface SqlExecutor {
  query(text: string, params: unknown[]): Promise<{ rows: Array<Record<string, unknown>> }>;
}

const nowIso = (): string => new Date().toISOString();

/* ─────────────────────────────── memory ─────────────────────────────────── */

export class MemoryLeadStore implements LeadStore {
  private readonly rows = new Map<string, LeadRecord>();

  async create(lead: NewLead): Promise<LeadRecord> {
    const timestamp = nowIso();
    const record: LeadRecord = {
      ...lead,
      id: randomUUID(),
      status: 'NEW',
      notificationStatus: 'PENDING',
      notificationAttempts: 0,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    this.rows.set(record.referenceId, record);
    return record;
  }

  async markNotification(
    referenceId: string,
    status: NotificationStatus,
    attemptDelta: number,
  ): Promise<void> {
    const record = this.rows.get(referenceId);
    if (!record) return;
    record.notificationStatus = status;
    record.notificationAttempts += attemptDelta;
    record.updatedAt = nowIso();
  }

  async getByReference(referenceId: string): Promise<LeadRecord | null> {
    return this.rows.get(referenceId) ?? null;
  }

  async listPendingNotifications(limit: number): Promise<LeadRecord[]> {
    return [...this.rows.values()].filter((r) => r.notificationStatus !== 'SENT').slice(0, limit);
  }
}

/* ─────────────────────────────── postgres ───────────────────────────────── */

const mapRow = (row: Record<string, unknown>): LeadRecord => ({
  id: String(row.id),
  referenceId: String(row.reference_id),
  locale: row.locale as LeadRecord['locale'],
  fullName: String(row.full_name),
  companyName: String(row.company_name),
  city: String(row.city),
  phoneOrEmail: String(row.phone_or_email),
  activityType: String(row.activity_type),
  interestedProduct: String(row.interested_product),
  timeframe: String(row.timeframe),
  preferredContactMethod: String(row.preferred_contact_method),
  challenge: String(row.challenge ?? ''),
  consent: Boolean(row.consent),
  marketingConsent: Boolean(row.marketing_consent),
  pageUrl: String(row.source_page),
  status: row.status as LeadRecord['status'],
  notificationStatus: row.notification_status as NotificationStatus,
  notificationAttempts: Number(row.notification_attempts ?? 0),
  submittedAt: new Date(String(row.submitted_at)).toISOString(),
  createdAt: new Date(String(row.created_at)).toISOString(),
  updatedAt: new Date(String(row.updated_at)).toISOString(),
});

export class PostgresLeadStore implements LeadStore {
  constructor(private readonly sql: SqlExecutor) {}

  async create(lead: NewLead): Promise<LeadRecord> {
    const { rows } = await this.sql.query(
      `INSERT INTO contact_leads
        (reference_id, locale, full_name, company_name, city, phone_or_email,
         activity_type, interested_product, timeframe, preferred_contact_method,
         challenge, consent, marketing_consent, source_page, status,
         notification_status, notification_attempts, submitted_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,'NEW','PENDING',0,$15)
       RETURNING *`,
      [
        lead.referenceId,
        lead.locale,
        lead.fullName,
        lead.companyName,
        lead.city,
        lead.phoneOrEmail,
        lead.activityType,
        lead.interestedProduct,
        lead.timeframe,
        lead.preferredContactMethod,
        lead.challenge,
        lead.consent,
        lead.marketingConsent,
        lead.pageUrl,
        lead.submittedAt,
      ],
    );
    return mapRow(rows[0]);
  }

  async markNotification(
    referenceId: string,
    status: NotificationStatus,
    attemptDelta: number,
  ): Promise<void> {
    await this.sql.query(
      `UPDATE contact_leads
         SET notification_status = $2,
             notification_attempts = notification_attempts + $3,
             updated_at = now()
       WHERE reference_id = $1`,
      [referenceId, status, attemptDelta],
    );
  }

  async getByReference(referenceId: string): Promise<LeadRecord | null> {
    const { rows } = await this.sql.query(
      `SELECT * FROM contact_leads WHERE reference_id = $1 LIMIT 1`,
      [referenceId],
    );
    return rows[0] ? mapRow(rows[0]) : null;
  }

  async listPendingNotifications(limit: number): Promise<LeadRecord[]> {
    const { rows } = await this.sql.query(
      `SELECT * FROM contact_leads
        WHERE notification_status <> 'SENT'
        ORDER BY created_at ASC
        LIMIT $1`,
      [limit],
    );
    return rows.map(mapRow);
  }
}

/* ─────────────────────────────── resolver ───────────────────────────────── */

let executorFactory: (() => SqlExecutor) | null = null;
let memorySingleton: MemoryLeadStore | null = null;

/**
 * The single wiring point for a live database. The production integration adds
 * one file that installs a client and calls this — nothing in `store.ts` moves.
 */
export function registerSqlExecutorFactory(factory: () => SqlExecutor): void {
  executorFactory = factory;
}

const memoryAllowed = (): boolean =>
  process.env.CONTACT_STORE_DRIVER === 'memory' &&
  (process.env.NODE_ENV === 'test' || process.env.CONTACT_ALLOW_MEMORY_STORE === 'true');

export function resolveLeadStore(config: ContactConfig): LeadStore | null {
  if (memoryAllowed()) {
    memorySingleton ??= new MemoryLeadStore();
    return memorySingleton;
  }
  if (config.storeConfigured && executorFactory) {
    return new PostgresLeadStore(executorFactory());
  }
  // Fail closed: a connection string with no wired driver is not a live store.
  return null;
}
