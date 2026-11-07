import { describe, expect, it, vi } from 'vitest';
import { OpenbankingService } from './openbanking.service';
import { BankJobData } from './openbanking.jobs';
import type { BankConnection } from './entities/bank-connection.entity';
import { NotificationType } from '../notifications/entities/notification.entity';

function setup() {
  const connection = {
    id: 'connection',
    user_id: 'user',
    provider_id: 'synci',
    credential_version: 1,
    encrypted_credentials: 'encrypted',
    accounts: [],
    updated_at: new Date('2026-11-01T00:00:00Z'),
  } as unknown as BankConnection;
  const query = {
    addSelect: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    setLock: vi.fn().mockReturnThis(),
    getOne: vi.fn().mockResolvedValue(connection),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    andWhere: vi.fn().mockReturnThis(),
    setParameter: vi.fn().mockReturnThis(),
    execute: vi.fn().mockResolvedValue({ affected: 1 }),
  };
  const manager = {
    getRepository: () => ({ createQueryBuilder: () => query }),
    save: vi.fn().mockResolvedValue(connection),
    createQueryBuilder: () => query,
  };
  const db = {
    transaction: vi.fn(
      async (operation: (manager: unknown) => Promise<unknown>) =>
        operation(manager),
    ),
  };
  const connections = {
    update: vi.fn().mockResolvedValue({ affected: 1 }),
    find: vi.fn().mockResolvedValue([connection]),
    findOne: vi.fn().mockResolvedValue(connection),
  };
  const adapter = {
    sync: vi.fn().mockResolvedValue({
      accountsSynced: 1,
      errors: [],
      newUncategorizedCount: 3,
    }),
    listAccounts: vi
      .fn<() => Promise<BankConnection['accounts']>>()
      .mockResolvedValue([]),
  };
  const notifications = {
    createSystemNotification: vi.fn().mockResolvedValue({}),
  };
  const jobs = { add: vi.fn().mockResolvedValue({ id: 'job' }) };
  const service = new OpenbankingService(
    connections as never,
    db as never,
    { get: () => adapter } as never,
    { decrypt: () => 'key' } as never,
    {} as never,
    jobs as never,
    notifications as never,
  );
  const data: BankJobData = {
    userId: 'user',
    connectionId: 'connection',
    credentialVersion: 1,
    operation: 'sync',
    notifyOnNewTransactions: true,
  };
  return {
    service,
    adapter,
    notifications,
    jobs,
    data,
    manager,
    connection,
    connections,
    query,
  };
}

describe('scheduled bank sync categorization notifications', () => {
  it('notifies the connection owner after a scheduled sync imports new transactions', async () => {
    const { service, notifications, data, manager } = setup();
    await service.process(data);
    expect(
      notifications.createSystemNotification,
    ).toHaveBeenCalledExactlyOnceWith({
      userId: 'user',
      message: 'You have 3 new transactions to categorize',
      icon: '👆',
      type: NotificationType.ACTION_REQUIRED,
      action: '/transactions/inbox',
    });
    expect(manager.save.mock.invocationCallOrder[0]).toBeLessThan(
      notifications.createSystemNotification.mock.invocationCallOrder[0],
    );
  });
  it.each([0, 3])(
    'does not notify for manual syncs (new count %i)',
    async (count) => {
      const { service, adapter, notifications, data } = setup();
      adapter.sync.mockResolvedValue({
        accountsSynced: 1,
        errors: [],
        newUncategorizedCount: count,
      });
      await service.process({ ...data, notifyOnNewTransactions: undefined });
      expect(notifications.createSystemNotification).not.toHaveBeenCalled();
    },
  );
  it('does not notify on a repeat sync with no new transactions', async () => {
    const { service, adapter, notifications, data } = setup();
    adapter.sync.mockResolvedValue({
      accountsSynced: 1,
      errors: [],
      newUncategorizedCount: 0,
    });
    await service.process(data);
    expect(notifications.createSystemNotification).not.toHaveBeenCalled();
  });
  it('notifies about successful imports when another account fails', async () => {
    const { service, adapter, notifications, data } = setup();
    adapter.sync.mockResolvedValue({
      accountsSynced: 1,
      errors: ['other-account'],
      newUncategorizedCount: 3,
    });
    const result = await service.process(data);
    expect(result.errors).toEqual(['other-account']);
    expect(notifications.createSystemNotification).toHaveBeenCalledOnce();
  });
  it('still notifies when discovery fails after committed transaction writes', async () => {
    const { service, adapter, notifications, data } = setup();
    adapter.listAccounts.mockRejectedValue(new Error('Discovery failed'));
    await expect(service.process(data)).rejects.toThrow('Discovery failed');
    expect(notifications.createSystemNotification).toHaveBeenCalledOnce();
  });
  it('does not fail a successful sync when notification delivery fails', async () => {
    const { service, notifications, data } = setup();
    notifications.createSystemNotification.mockRejectedValue(
      new Error('Notification failed'),
    );
    await expect(service.process(data)).resolves.toMatchObject({
      accountsSynced: 1,
    });
  });
  it('marks scheduled jobs for notification and keeps their deduplication separate', async () => {
    const { service, jobs } = setup();
    await service.syncAll();
    expect(jobs.add.mock.calls[0][1]).toMatchObject({
      userId: 'user',
      notifyOnNewTransactions: true,
    });
    await service.enqueue({
      userId: 'user',
      id: 'connection',
      operation: 'sync',
    });
    expect(jobs.add.mock.calls[0][2].deduplication.id).not.toBe(
      jobs.add.mock.calls[1][2].deduplication.id,
    );
  });
});

describe('bank connection refresh state', () => {
  it('records provider failures after rollback without overwriting a newer connection version', async () => {
    const { service, adapter, data, connections, connection } = setup();
    adapter.sync.mockRejectedValue(new Error('Provider unavailable'));
    await expect(service.process(data)).rejects.toThrow('Provider unavailable');
    expect(connections.update).toHaveBeenCalledWith(
      {
        id: 'connection',
        user_id: 'user',
        credential_version: 1,
        updated_at: connection.updated_at,
      },
      { last_error: { accountIds: null } },
    );
  });
  it('does not mark stale jobs as provider failures', async () => {
    const { service, data, connections } = setup();
    await expect(
      service.process({ ...data, credentialVersion: 2 }),
    ).rejects.toThrow('Credentials changed');
    expect(connections.update).not.toHaveBeenCalled();
  });
  it('clears previous errors and advances successful refresh dates', async () => {
    const { service, adapter, data, connection } = setup();
    connection.last_error = { accountIds: null };
    adapter.listAccounts.mockResolvedValue([
      {
        id: 'remote',
        name: 'Bank account',
        institutionName: null,
        currency: 'GBP',
        linkedAccountId: 'local',
      },
    ]);
    await service.process(data);
    expect(connection.last_error).toBeNull();
    expect(connection.accounts[0].lastRefresh).toBeTruthy();
  });
  it('stores original account JSON on the owned provider link, outside public discovery metadata', async () => {
    const { service, adapter, data, connection, query } = setup();
    const raw = { id: 'remote', extra: { debug: true } };
    adapter.listAccounts.mockResolvedValue([
      {
        id: 'remote',
        name: 'Bank account',
        institutionName: null,
        currency: 'GBP',
        linkedAccountId: 'local',
        raw,
      },
    ]);
    await service.process({ ...data, operation: 'refresh' });
    expect(query.where).toHaveBeenCalledWith({
      user_id: 'user',
      provider: 'synci',
      remote_account_id: 'remote',
    });
    expect(query.setParameter).toHaveBeenCalledWith('raw', JSON.stringify(raw));
    expect(connection.accounts[0]).not.toHaveProperty('raw');
    expect(
      (await service.accounts({ userId: 'user', id: 'connection' }))
        .accounts[0],
    ).not.toHaveProperty('raw');
  });
  it('does not advance refresh dates for expired consent', async () => {
    const { service, adapter, data, connection } = setup();
    const old = '2026-11-01T00:00:00.000Z';
    const account = {
      id: 'expired',
      name: 'Bank account',
      institutionName: null,
      currency: 'GBP',
      linkedAccountId: 'local',
      lastRefresh: old,
      connectionExpiresAt: '2020-01-01T00:00:00Z',
    };
    connection.accounts = [account];
    adapter.listAccounts.mockResolvedValue([account]);
    await service.process({ ...data, operation: 'refresh' });
    expect(connection.accounts[0]).toMatchObject({
      lastRefresh: old,
      connectionStatus: 'expired',
    });
  });
  it('preserves failed account refresh dates and records only affected ids', async () => {
    const { service, adapter, data, connection } = setup();
    const old = '2026-11-01T00:00:00.000Z';
    const account = {
      id: 'failed',
      name: 'Bank account',
      institutionName: null,
      currency: 'GBP',
      linkedAccountId: 'local',
      lastRefresh: old,
    };
    connection.accounts = [account];
    adapter.sync.mockResolvedValue({
      accountsSynced: 1,
      errors: ['failed'],
      newUncategorizedCount: 0,
    });
    adapter.listAccounts.mockResolvedValue([
      account,
      { ...account, id: 'healthy' },
    ]);
    await service.process(data);
    expect(connection.last_error).toEqual({ accountIds: ['failed'] });
    expect(connection.accounts[0].lastRefresh).toBe(old);
    expect(connection.accounts[1].lastRefresh).not.toBe(old);
  });
});
