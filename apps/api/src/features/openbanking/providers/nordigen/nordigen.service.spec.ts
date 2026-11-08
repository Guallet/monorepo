import { NordigenService } from './nordigen.service';

const context = {
  userId: 'user',
  connectionId: 'connection',
  credentials: { secretId: 'id', secretKey: 'key' },
};
function setup() {
  const client = {
    getToken: vi.fn().mockResolvedValue('token'),
    getAuthorization: vi
      .fn()
      .mockResolvedValue({ status: 'LN', agreement: 'agreement' }),
    getAgreement: vi.fn().mockResolvedValue({
      accepted: '2026-11-01T00:00:00Z',
      access_valid_for_days: 90,
    }),
    getDetails: vi.fn().mockResolvedValue({
      account: { name: 'Bank account', currency: 'GBP' },
    }),
  };
  const authorizations = {
    find: vi.fn().mockResolvedValue([
      {
        remote_id: 'remote-authorization',
        account_ids: ['remote'],
        completed_at: new Date('2026-11-01T00:00:00Z'),
        expires_at: new Date('2026-11-01T01:00:00Z'),
      },
    ]),
  };
  const links = {
    find: vi
      .fn()
      .mockResolvedValue([
        { remote_account_id: 'remote', guallet_account_id: 'local' },
      ]),
  };
  const service = new NordigenService(
    client as never,
    authorizations as never,
    links as never,
    {} as never,
    {} as never,
  );
  return { client, authorizations, service };
}

describe('Nordigen consent state', () => {
  it('derives expiry from the agreement rather than the callback deadline', async () => {
    const { service, authorizations } = setup();
    expect(await service.listAccounts(context)).toEqual([
      expect.objectContaining({
        id: 'remote',
        connectionStatus: 'connected',
        connectionExpiresAt: '2027-01-30T00:00:00.000Z',
      }),
    ]);
    expect(authorizations.find).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          user_id: 'user',
          connection_id: 'connection',
        }),
      }),
    );
  });
  it('preserves expired linked accounts when bank details are unavailable', async () => {
    const { service, client } = setup();
    client.getAuthorization.mockResolvedValue({
      status: 'EX',
      agreement: 'agreement',
    });
    client.getDetails.mockRejectedValue(new Error('Consent expired'));
    expect(await service.listAccounts(context)).toEqual([
      expect.objectContaining({
        id: 'remote',
        linkedAccountId: 'local',
        connectionStatus: 'expired',
      }),
    ]);
  });
  it('records metadata failures as connection errors', async () => {
    const { service, client } = setup();
    client.getAgreement.mockRejectedValue(new Error('Provider unavailable'));
    expect(await service.listAccounts(context)).toEqual([
      expect.objectContaining({ connectionStatus: 'connectionError' }),
    ]);
  });
});

describe('Nordigen account names', () => {
  it.each([true, false])(
    'preserves a local name when an existing link is %s',
    async (existing) => {
      const client = {
        getToken: vi.fn().mockResolvedValue('token'),
        getDetails: vi
          .fn()
          .mockResolvedValue({
            account: { name: 'Bank name', currency: 'GBP' },
          }),
        getBalances: vi.fn().mockResolvedValue([]),
        getTransactions: vi.fn().mockResolvedValue([]),
      };
      const link = { remote_account_id: 'remote', guallet_account_id: 'local' };
      const links = {
        findOne: vi.fn().mockResolvedValue(existing ? link : null),
        save: vi.fn().mockResolvedValue(link),
      };
      const save = vi
        .fn()
        .mockImplementation(async (_entity, value) => ({
          id: 'local',
          ...value,
        }));
      const accounts = {
        findOne: vi
          .fn()
          .mockResolvedValue({
            id: 'local',
            name: 'My savings',
            currency: 'GBP',
          }),
        manager: {
          transaction: vi
            .fn()
            .mockImplementation(async (callback) => callback({ save })),
        },
      };
      const service = new NordigenService(
        client as never,
        {
          find: vi.fn().mockResolvedValue([{ account_ids: ['remote'] }]),
        } as never,
        links as never,
        accounts as never,
        {} as never,
      );
      expect(
        await service.importAccounts({ ...context, accountIds: ['remote'] }),
      ).toEqual(['local']);
      expect(save.mock.calls[0][1].name).toBe(
        existing ? 'My savings' : 'Bank name',
      );
    },
  );
});
