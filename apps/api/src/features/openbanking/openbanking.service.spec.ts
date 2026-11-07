import { describe, expect, it, vi } from 'vitest';
import { OpenbankingService } from './openbanking.service';
import { BankJobData } from './openbanking.jobs';
import { NotificationType } from '../notifications/entities/notification.entity';

function setup() {
  const connection = {
    id: 'connection',
    user_id: 'user',
    provider_id: 'synci',
    credential_version: 1,
    encrypted_credentials: 'encrypted',
    accounts: [],
  };
  const query = {
    addSelect: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    setLock: vi.fn().mockReturnThis(),
    getOne: vi.fn().mockResolvedValue(connection),
  };
  const manager = {
    getRepository: () => ({ createQueryBuilder: () => query }),
    save: vi.fn().mockResolvedValue(connection),
  };
  const db = {
    transaction: vi.fn(
      async (operation: (manager: unknown) => Promise<unknown>) =>
        operation(manager),
    ),
  };
  const connections = {
    find: vi.fn().mockResolvedValue([connection]),
    findOne: vi.fn().mockResolvedValue(connection),
  };
  const adapter = {
    sync: vi.fn().mockResolvedValue({
      accountsSynced: 1,
      errors: [],
      newUncategorizedCount: 3,
    }),
    listAccounts: vi.fn().mockResolvedValue([]),
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
  return { service, adapter, notifications, jobs, data, manager };
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
