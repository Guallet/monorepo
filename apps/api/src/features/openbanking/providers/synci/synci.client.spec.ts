import { of, throwError } from 'rxjs';
import { SynciClient } from './synci.client';

describe('Synci connection metadata', () => {
  it.each(['CONNECTED', 'EXPIRED', 'ERROR'])(
    'loads consent expiry once per financial connection with status %s',
    async (status) => {
      const http = {
        get: vi.fn().mockImplementation((url: string) =>
          of({
            data: url.includes('/connections/')
              ? { data: { status, consent_expires_at: '2026-12-01T00:00:00Z' } }
              : {
                  data: [
                    { id: 1, financial_connection_id: 9 },
                    { id: 2, financial_connection_id: 9 },
                  ],
                },
          }),
        ),
      };
      const accounts = await new SynciClient(http as never).getAccounts('key');
      expect(http.get).toHaveBeenCalledTimes(2);
      expect(accounts).toHaveLength(2);
      const expectedStatus = {
        CONNECTED: 'connected',
        EXPIRED: 'expired',
        ERROR: 'connectionError',
      }[status];
      expect(accounts[0]).toMatchObject({
        connectionExpiresAt: '2026-12-01T00:00:00Z',
        connectionStatus: expectedStatus,
      });
    },
  );
  it('retains fields unknown to the normalized account model in raw', async () => {
    const raw = {
      id: 1,
      name: 'Bank account',
      extra: { institutionReference: 'original' },
    };
    const http = {
      get: vi.fn().mockReturnValue(of({ data: { data: [raw] } })),
    };
    const accounts = await new SynciClient(http as never).getAccounts('key');
    expect(accounts[0].raw).toEqual(raw);
    expect(accounts[0].raw).not.toHaveProperty('connectionStatus');
  });
  it('keeps accounts visible when connection metadata fails', async () => {
    const http = {
      get: vi
        .fn()
        .mockImplementation((url: string) =>
          url.includes('/connections/')
            ? throwError(() => new Error('Unavailable'))
            : of({ data: { data: [{ id: 1, financial_connection_id: 9 }] } }),
        ),
    };
    const accounts = await new SynciClient(http as never).getAccounts('key');
    expect(accounts[0]).toMatchObject({
      id: 1,
      connectionStatus: 'connectionError',
    });
  });
});

describe('Synci provider response mapping', () => {
  it('requests the institution relationship used by the import wizard', async () => {
    const http = {
      get: vi.fn().mockReturnValue(
        of({
          data: {
            data: [
              {
                id: 1,
                financial_connection: {
                  institution: { name: 'Bank', logo: 'logo' },
                },
              },
            ],
          },
        }),
      ),
    };
    const accounts = await new SynciClient(http as never).getAccounts('key');
    expect(http.get).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        params: expect.objectContaining({
          include: 'financial_connection.institution',
        }),
      }),
    );
    expect(accounts[0]).toMatchObject({
      institution_name: 'Bank',
      institution_logo: 'logo',
    });
  });
  it.each(['booking_datetime', 'value_datetime'])(
    'accepts a transaction with only %s',
    async (field) => {
      const http = {
        get: vi.fn().mockReturnValue(
          of({
            data: {
              data: [
                {
                  id: 1,
                  amount: 10,
                  currency: 'GBP',
                  [field]: '2026-11-01T12:00:00Z',
                },
              ],
            },
          }),
        ),
      };
      const transactions = await new SynciClient(http as never).getTransactions(
        'key',
        'account',
      );
      expect(transactions[0].date).toBe('2026-11-01T12:00:00Z');
    },
  );
  it.each([{}, { booking_date: 'invalid' }])(
    'rejects transactions without a usable date: %j',
    async (dates) => {
      const http = {
        get: vi.fn().mockReturnValue(
          of({
            data: {
              data: [
                {
                  id: 1,
                  amount: 10,
                  ...dates,
                },
              ],
            },
          }),
        ),
      };
      await expect(
        new SynciClient(http as never).getTransactions('key', 'account'),
      ).rejects.toThrow('Synci transaction has no valid date');
    },
  );
});
