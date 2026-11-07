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
