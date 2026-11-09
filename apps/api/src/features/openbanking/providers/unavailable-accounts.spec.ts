import { LunchFlowService } from './lunchflow/lunchflow.service';
import { SynciService } from './synci/synci.service';

const context = {
  userId: 'user',
  connectionId: 'connection',
  credentials: { apiKey: 'key' },
};

describe.each([
  ['lunchflow', LunchFlowService],
  ['synci', SynciService],
] as const)('%s discovery', (provider, Service) => {
  it('retains missing links for unlinking and omits unlinked accounts', async () => {
    const links = {
      find: vi.fn().mockResolvedValue([
        {
          remote_account_id: 'missing',
          guallet_account_id: 'local',
          is_linked: true,
        },
        {
          remote_account_id: 'healthy',
          guallet_account_id: 'healthy-local',
          is_linked: true,
        },
        {
          remote_account_id: 'unlinked',
          guallet_account_id: 'unlinked-local',
          is_linked: false,
        },
      ]),
    };
    const accounts = {
      find: vi
        .fn()
        .mockResolvedValue([
          { id: 'local', name: 'My savings', currency: 'GBP' },
        ]),
    };
    const client = {
      getAccounts: vi
        .fn()
        .mockResolvedValue([
          { id: 'healthy', name: 'Current', currency: 'GBP' },
        ]),
    };
    const service = new Service(
      links as never,
      accounts as never,
      {} as never,
      client as never,
    );
    const result = await service.listAccounts(context);
    expect(result).toHaveLength(2);
    expect(result).toContainEqual(
      expect.objectContaining({
        id: 'missing',
        name: 'My savings',
        currency: 'GBP',
        linkedAccountId: 'local',
        status: 'unavailable',
        connectionStatus: 'connectionError',
      }),
    );
    expect(result).toContainEqual(
      expect.objectContaining({
        id: 'healthy',
        linkedAccountId: 'healthy-local',
      }),
    );
    expect(links.find).toHaveBeenCalledWith({
      where: { user_id: 'user', provider },
    });
    expect(accounts.find).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ user_id: 'user' }),
      }),
    );
  });
  it('propagates discovery failures instead of reporting success', async () => {
    const service = new Service(
      { find: vi.fn().mockResolvedValue([]) } as never,
      {} as never,
      {} as never,
      {
        getAccounts: vi
          .fn()
          .mockRejectedValue(new Error('Provider unavailable')),
      } as never,
    );
    await expect(service.listAccounts(context)).rejects.toThrow(
      'Provider unavailable',
    );
  });
});
