import { NotFoundException } from '@nestjs/common';
import { OpenbankingService } from './openbanking.service';

describe('OpenbankingService.getConnectionFoGualletAccount', () => {
  const now = new Date('2026-11-07T12:00:00Z');
  const syncedAt = new Date('2026-11-07T10:00:00Z');
  const refreshedAt = new Date('2026-11-07T11:00:00Z');
  const accounts = { findOne: vi.fn() };
  const connections = { findOne: vi.fn() };
  const links = { find: vi.fn() };
  let service: OpenbankingService;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(now);
    accounts.findOne.mockReset().mockResolvedValue({ id: 'account' });
    connections.findOne
      .mockReset()
      .mockResolvedValue({ id: 'connection', accounts: [], last_error: null });
    links.find.mockReset().mockResolvedValue([]);
    service = new OpenbankingService(
      connections as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      accounts as never,
      links as never,
    );
  });
  afterEach(() => vi.useRealTimers());

  it.each(['lunchflow', 'banksync', 'synci', 'nordigen'] as const)(
    'uses the provider stored on the shared %s link',
    async (provider) => {
      const remoteId = provider === 'banksync' ? '["bank","remote"]' : 'remote';
      links.find.mockResolvedValue([
        { provider, remote_account_id: remoteId, last_synced_at: syncedAt },
      ]);
      expect(
        await service.getConnectionFoGualletAccount('user', 'account'),
      ).toEqual({
        id: 'connection',
        providerId: provider,
        remoteAccountId: remoteId,
        lastRefresh: syncedAt,
        daysRemaining: null,
        status: 'connected',
      });
      expect(links.find).toHaveBeenCalledWith({
        where: {
          user_id: 'user',
          guallet_account_id: 'account',
          is_linked: true,
        },
        order: { created_at: 'ASC', id: 'ASC' },
      });
      expect(connections.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { user_id: 'user', provider_id: provider },
        }),
      );
    },
  );
  it.each([
    {
      expiry: '2026-11-09T13:00:00Z',
      error: null,
      status: 'connected',
      days: 3,
    },
    {
      expiry: '2026-11-07T12:00:00Z',
      error: { accountIds: null },
      status: 'expired',
      days: 0,
    },
    {
      expiry: null,
      error: { accountIds: null },
      status: 'connectionError',
      days: null,
    },
    {
      expiry: null,
      error: { accountIds: ['remote'] },
      status: 'connectionError',
      days: null,
    },
    {
      expiry: null,
      error: { accountIds: ['another'] },
      status: 'connected',
      days: null,
    },
    { expiry: 'invalid', error: null, status: 'connected', days: null },
  ])(
    'calculates $status with $days remaining days',
    async ({ expiry, error, status, days }) => {
      links.find.mockResolvedValue([
        {
          provider: 'synci',
          remote_account_id: 'remote',
          created_at: syncedAt,
        },
      ]);
      connections.findOne.mockResolvedValue({
        id: 'connection',
        accounts: [
          {
            id: 'remote',
            connectionExpiresAt: expiry,
            lastRefresh: refreshedAt.toISOString(),
          },
        ],
        last_error: error,
      });
      expect(
        await service.getConnectionFoGualletAccount('user', 'account'),
      ).toMatchObject({
        lastRefresh: refreshedAt,
        daysRemaining: days,
        status,
      });
    },
  );
  it('uses the link date before any refresh', async () => {
    links.find.mockResolvedValue([
      {
        provider: 'synci',
        remote_account_id: 'remote',
        created_at: syncedAt,
        last_synced_at: null,
      },
    ]);
    expect(
      await service.getConnectionFoGualletAccount('user', 'account'),
    ).toMatchObject({
      lastRefresh: syncedAt,
    });
  });
  it('reports explicit expiry without an expiry date', async () => {
    links.find.mockResolvedValue([
      { provider: 'synci', remote_account_id: 'remote' },
    ]);
    connections.findOne.mockResolvedValue({
      id: 'connection',
      accounts: [{ id: 'remote', connectionStatus: 'expired' }],
    });
    expect(
      await service.getConnectionFoGualletAccount('user', 'account'),
    ).toMatchObject({
      status: 'expired',
      daysRemaining: 0,
    });
  });
  it('returns null for unlinked accounts', async () => {
    expect(
      await service.getConnectionFoGualletAccount('user', 'account'),
    ).toBeNull();
    expect(connections.findOne).not.toHaveBeenCalled();
  });
  it('returns null for removed provider connections', async () => {
    links.find.mockResolvedValue([
      { provider: 'synci', remote_account_id: 'remote' },
    ]);
    connections.findOne.mockResolvedValue(null);
    expect(
      await service.getConnectionFoGualletAccount('user', 'account'),
    ).toBeNull();
  });
  it('rejects other-user or missing accounts before querying links', async () => {
    accounts.findOne.mockResolvedValue(null);
    await expect(
      service.getConnectionFoGualletAccount('user', 'account'),
    ).rejects.toThrow(NotFoundException);
    expect(accounts.findOne).toHaveBeenCalledWith({
      where: { user_id: 'user', id: 'account' },
      select: { id: true },
    });
    expect(links.find).not.toHaveBeenCalled();
  });
});
