import { describe, expect, it, vi } from 'vitest';
import { BankSyncService } from './banksync.service';

const context = {
  userId: 'user',
  connectionId: 'connection',
  credentials: { apiKey: 'key' },
};
function setup() {
  const mappings = {
    find: vi.fn().mockResolvedValue([
      {
        user_id: 'user',
        provider: 'banksync',
        remote_connection_id: 'unavailable-bank',
        remote_account_id: '["unavailable-bank","remote"]',
        guallet_account_id: 'local',
        is_linked: true,
      },
      {
        user_id: 'user',
        provider: 'banksync',
        remote_connection_id: 'healthy-bank',
        remote_account_id: '["healthy-bank","healthy"]',
        guallet_account_id: 'healthy-local',
        is_linked: true,
      },
      {
        user_id: 'user',
        provider: 'banksync',
        remote_connection_id: 'unavailable-bank',
        remote_account_id: '["unavailable-bank","unlinked"]',
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
    getBanks: vi.fn().mockResolvedValue([
      {
        id: 'unavailable-bank',
        name: 'Unavailable bank',
        connectionStatus: { connected: false },
      },
      { id: 'healthy-bank', name: 'Healthy bank' },
    ]),
    getAccounts: vi
      .fn()
      .mockResolvedValue([
        { id: 'healthy', name: 'Current account', currency: 'GBP' },
      ]),
  };
  const service = new BankSyncService(
    mappings as never,
    accounts as never,
    {} as never,
    client as never,
  );
  return { service, client, accounts };
}

describe('BankSync unavailable linked accounts', () => {
  it.each([
    'disconnected',
    'request failed',
    'bank removed',
    'account removed',
  ])('retains unlink identity when %s', async (scenario) => {
    const { service, client, accounts } = setup();
    if (scenario === 'request failed') {
      client.getBanks.mockResolvedValue([
        { id: 'unavailable-bank', name: 'Unavailable bank' },
        { id: 'healthy-bank', name: 'Healthy bank' },
      ]);
      client.getAccounts.mockImplementation(async (_key, bankId) => {
        if (bankId === 'unavailable-bank') throw new Error('Expired consent');
        return [{ id: 'healthy', name: 'Current account', currency: 'GBP' }];
      });
    } else if (scenario === 'bank removed') {
      client.getBanks.mockResolvedValue([
        { id: 'healthy-bank', name: 'Healthy bank' },
      ]);
    } else if (scenario === 'account removed') {
      client.getBanks.mockResolvedValue([
        { id: 'unavailable-bank', name: 'Unavailable bank' },
        { id: 'healthy-bank', name: 'Healthy bank' },
      ]);
      client.getAccounts.mockImplementation(async (_key, bankId) =>
        bankId === 'unavailable-bank'
          ? []
          : [{ id: 'healthy', name: 'Current account', currency: 'GBP' }],
      );
    }
    const discovered = await service.listAccounts(context);
    expect(discovered).toHaveLength(2);
    expect(discovered).toContainEqual(
      expect.objectContaining({
        id: JSON.stringify(['unavailable-bank', 'remote']),
        name: 'My savings',
        currency: 'GBP',
        linkedAccountId: 'local',
        status: 'unavailable',
      }),
    );
    expect(discovered).toContainEqual(
      expect.objectContaining({
        id: JSON.stringify(['healthy-bank', 'healthy']),
        linkedAccountId: 'healthy-local',
      }),
    );
    expect(accounts.find).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ user_id: 'user' }),
      }),
    );
  });
  it('does not turn a provider-wide discovery failure into an empty success', async () => {
    const { service, client } = setup();
    client.getBanks.mockRejectedValue(new Error('Invalid credentials'));
    await expect(service.listAccounts(context)).rejects.toThrow(
      'Invalid credentials',
    );
  });
});
