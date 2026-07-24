import { describe, expect, it } from 'vitest';
import { MemoryLeadStore, PostgresLeadStore, type SqlExecutor } from '@/lib/contact/store';
import type { NewLead } from '@/lib/contact/types';

const lead = (): NewLead => ({
  locale: 'ar',
  fullName: 'اسم',
  companyName: 'شركة',
  city: 'الرياض',
  phoneOrEmail: '+966500000000',
  activityType: 'شركة / فروع',
  interestedProduct: 'سلطان',
  timeframe: 'أستكشف',
  preferredContactMethod: 'اتصال',
  challenge: '',
  consent: true,
  marketingConsent: false,
  pageUrl: 'https://talamir.org/ar',
  referenceId: 'TAL-ABCDEFGH',
  submittedAt: new Date(1_720_000_000_000).toISOString(),
});

describe('MemoryLeadStore', () => {
  it('creates a NEW / PENDING lead and reads it back by reference', async () => {
    const store = new MemoryLeadStore();
    const created = await store.create(lead());
    expect(created.status).toBe('NEW');
    expect(created.notificationStatus).toBe('PENDING');
    expect(created.id).not.toBe(created.referenceId);

    const found = await store.getByReference('TAL-ABCDEFGH');
    expect(found?.fullName).toBe('اسم');
  });

  it('updates notification state and lists what has not sent', async () => {
    const store = new MemoryLeadStore();
    await store.create(lead());
    await store.markNotification('TAL-ABCDEFGH', 'FAILED', 1);
    const pending = await store.listPendingNotifications(10);
    expect(pending).toHaveLength(1);
    expect(pending[0].notificationStatus).toBe('FAILED');

    await store.markNotification('TAL-ABCDEFGH', 'SENT', 1);
    expect(await store.listPendingNotifications(10)).toHaveLength(0);
  });
});

describe('PostgresLeadStore', () => {
  /** A fake executor that records calls and echoes inserted values as a row. */
  const fakeExecutor = () => {
    const calls: Array<{ text: string; params: unknown[] }> = [];
    const executor: SqlExecutor = {
      query: async (text, params) => {
        calls.push({ text, params });
        if (/^INSERT/i.test(text.trim())) {
          const [
            reference_id,
            locale,
            full_name,
            company_name,
            city,
            phone_or_email,
            activity_type,
            interested_product,
            timeframe,
            preferred_contact_method,
            challenge,
            consent,
            marketing_consent,
            source_page,
            submitted_at,
          ] = params as string[];
          return {
            rows: [
              {
                id: '00000000-0000-0000-0000-000000000001',
                reference_id,
                locale,
                full_name,
                company_name,
                city,
                phone_or_email,
                activity_type,
                interested_product,
                timeframe,
                preferred_contact_method,
                challenge,
                consent,
                marketing_consent,
                source_page,
                status: 'NEW',
                notification_status: 'PENDING',
                notification_attempts: 0,
                submitted_at,
                created_at: submitted_at,
                updated_at: submitted_at,
              },
            ],
          };
        }
        return { rows: [] };
      },
    };
    return { executor, calls };
  };

  it('inserts with a fully parameterized statement', async () => {
    const { executor, calls } = fakeExecutor();
    const store = new PostgresLeadStore(executor);
    const record = await store.create(lead());

    expect(record.id).toBe('00000000-0000-0000-0000-000000000001');
    expect(record.referenceId).toBe('TAL-ABCDEFGH');
    expect(record.status).toBe('NEW');

    const insert = calls[0];
    // No interpolation: every value arrives as a bound parameter.
    expect(insert.text).toContain('$15');
    expect(insert.text).not.toMatch(/\$\{|'\s*\+\s*/); // no template/concat of values
    expect(insert.params).toHaveLength(15);
    expect(insert.params).toContain('TAL-ABCDEFGH');
  });

  it('parameterizes the notification update and the lookup', async () => {
    const { executor, calls } = fakeExecutor();
    const store = new PostgresLeadStore(executor);
    await store.markNotification('TAL-ABCDEFGH', 'SENT', 1);
    await store.getByReference('TAL-ABCDEFGH');

    expect(calls[0].text).toContain('WHERE reference_id = $1');
    expect(calls[0].params).toEqual(['TAL-ABCDEFGH', 'SENT', 1]);
    expect(calls[1].text).toContain('WHERE reference_id = $1');
    expect(calls[1].params).toEqual(['TAL-ABCDEFGH']);
  });
});
