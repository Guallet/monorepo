import { describe, expect, it, vi } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { BankConnection as BankConnectionEntity } from './entities/bank-connection.entity';
import { OpenbankingService } from './openbanking.service';
import { BankJobData } from './openbanking.jobs';
import type { BankConnection } from './entities/bank-connection.entity';
import { NotificationType } from '../notifications/entities/notification.entity';

function setup() {
  const connection = {
    id: 'connection',
    user_id: 'user',
    provider_id: 'synci',
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
    delete: vi.fn().mockResolvedValue({ affected: 1 }),
  };
  const repositoryManager = {
    transaction: vi.fn(
      async (operation: (manager: unknown) => Promise<unknown>) =>
        operation(manager),
    ),
  };
  const connections = {
    manager: repositoryManager,
    update: vi.fn().mockResolvedValue({ affected: 1 }),
    find: vi.fn().mockResolvedValue([connection]),
    findOne: vi.fn().mockResolvedValue(connection),
  };
  const adapter = {
    validateCredentials: vi.fn().mockResolvedValue(undefined),
    disconnect: vi.fn().mockResolvedValue(undefined),
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
  const userCredentials = {
    getCredentials: vi.fn().mockResolvedValue({
      id: 'credential',
      value: '{"apiKey":"key"}',
      version: 1,
      hint: 'hint',
    }),
    getCredentialMetadata: vi
      .fn()
      .mockResolvedValue({ id: 'credential', version: 1, hint: 'hint' }),
    setCredentials: vi.fn().mockResolvedValue(undefined),
    removeCredentials: vi.fn().mockResolvedValue(undefined),
  };
  const service = new OpenbankingService(
    connections as never,
    { get: () => adapter } as never,
    userCredentials as never,
    {} as never,
    jobs as never,
    notifications as never,
    {} as never,
    {} as never,
  );
  const data: BankJobData = {
    userId: 'user',
    connectionId: 'connection',
    credentialId: 'credential',
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
    userCredentials,
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

describe('bank provider credential lookup', () => {
  it('loads credentials using the connection owner and provider', async () => {
    const { service, data, userCredentials, manager, adapter } = setup();
    await service.process(data);
    expect(userCredentials.getCredentials).toHaveBeenCalledWith(
      { userId: 'user', key: 'openbanking:synci' },
      manager,
    );
    expect(adapter.sync).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user',
        connectionId: 'connection',
        credentials: { apiKey: 'key' },
      }),
    );
  });
  it('uses the credential store revision when enqueueing work', async () => {
    const { service, jobs, userCredentials } = setup();
    userCredentials.getCredentialMetadata.mockResolvedValue({
      version: 7,
      hint: 'hint',
    });
    await service.enqueue({
      userId: 'user',
      id: 'connection',
      operation: 'sync',
    });
    expect(jobs.add.mock.calls[0][1].credentialVersion).toBe(7);
    expect(jobs.add.mock.calls[0][2].deduplication.id).toContain(
      'connection_7_',
    );
  });
  it('does not call the provider when credentials are missing', async () => {
    const { service, data, userCredentials, adapter, connections } = setup();
    userCredentials.getCredentials.mockRejectedValue(
      new NotFoundException('Credentials not found'),
    );
    await expect(service.process(data)).rejects.toThrow(
      'Credentials not found',
    );
    expect(adapter.sync).not.toHaveBeenCalled();
    expect(connections.update).not.toHaveBeenCalled();
  });
  it('rejects work queued before credential replacement', async () => {
    const { service, data, userCredentials, adapter } = setup();
    userCredentials.getCredentials.mockResolvedValue({
      id: 'credential',
      value: '{"apiKey":"new-key"}',
      version: 2,
      hint: 'hint',
    });
    await expect(service.process(data)).rejects.toThrow('Credentials changed');
    expect(adapter.sync).not.toHaveBeenCalled();
  });
  it('rejects work when credentials have been deleted and recreated at the same revision', async () => {
    const { service, data, userCredentials, adapter } = setup();
    userCredentials.getCredentials.mockResolvedValue({
      id: 'new-credential',
      value: '{"apiKey":"new-key"}',
      version: 1,
      hint: 'hint',
    });
    await expect(service.process(data)).rejects.toThrow('Credentials changed');
    expect(adapter.sync).not.toHaveBeenCalled();
  });
  it('does not record an old provider failure against newer credentials', async () => {
    const { service, data, userCredentials, adapter, connections } = setup();
    adapter.sync.mockRejectedValue(new Error('Old provider failure'));
    userCredentials.getCredentialMetadata.mockResolvedValue({
      version: 2,
      hint: 'hint',
    });
    await expect(service.process(data)).rejects.toThrow('Old provider failure');
    expect(connections.update).not.toHaveBeenCalled();
  });
  it('stores credentials separately when creating a connection', async () => {
    const { service, connections, manager, userCredentials } = setup();
    connections.findOne.mockResolvedValueOnce(null);
    const secret = 'provider-secret-1234';
    await service.create({
      userId: 'user',
      input: { providerId: 'synci', credentials: { apiKey: secret } },
    });
    expect(manager.save).toHaveBeenCalledWith(BankConnectionEntity, {
      id: expect.any(String),
      user_id: 'user',
      provider_id: 'synci',
      accounts: [],
    });
    expect(userCredentials.setCredentials).toHaveBeenCalledWith(
      { userId: 'user', key: 'openbanking:synci' },
      JSON.stringify({ apiKey: secret }),
      '1234',
      manager,
    );
    expect(JSON.stringify(manager.save.mock.calls)).not.toContain(secret);
  });
  it('does not persist rejected credentials', async () => {
    const { service, connections, manager, userCredentials, adapter } = setup();
    connections.findOne.mockResolvedValueOnce(null);
    adapter.validateCredentials.mockRejectedValue(new Error('Rejected'));
    await expect(
      service.create({
        userId: 'user',
        input: { providerId: 'synci', credentials: { apiKey: 'rejected' } },
      }),
    ).rejects.toThrow('Rejected');
    expect(manager.save).not.toHaveBeenCalled();
    expect(userCredentials.setCredentials).not.toHaveBeenCalled();
  });
  it('replaces stored credentials and resets discovery without putting secrets on the connection', async () => {
    const { service, userCredentials, manager, connection } = setup();
    connection.accounts_refreshed_at = new Date();
    await service.replaceCredentials({
      userId: 'user',
      id: 'connection',
      credentials: { apiKey: 'replacement-5678' },
    });
    expect(userCredentials.setCredentials).toHaveBeenCalledWith(
      { userId: 'user', key: 'openbanking:synci' },
      JSON.stringify({ apiKey: 'replacement-5678' }),
      '5678',
      manager,
    );
    expect(connection.accounts_refreshed_at).toBeNull();
    expect(connection).not.toHaveProperty('encrypted_credentials');
    expect(connection).not.toHaveProperty('credential_hint');
    expect(connection).not.toHaveProperty('credential_version');
  });
  it('removes only the owned provider credentials when disconnecting', async () => {
    const { service, userCredentials, manager, adapter } = setup();
    await service.remove({ userId: 'user', id: 'connection' });
    expect(adapter.disconnect).toHaveBeenCalledWith({
      userId: 'user',
      connectionId: 'connection',
    });
    expect(userCredentials.removeCredentials).toHaveBeenCalledWith(
      { userId: 'user', key: 'openbanking:synci' },
      manager,
    );
    expect(manager.delete).toHaveBeenCalledWith(BankConnectionEntity, {
      id: 'connection',
      user_id: 'user',
    });
    expect(userCredentials.getCredentials).not.toHaveBeenCalled();
  });
  it('reads the display hint without decrypting credentials', async () => {
    const { service, userCredentials } = setup();
    expect(
      await service.get({ userId: 'user', id: 'connection' }),
    ).toMatchObject({ credentialHint: 'hint' });
    expect(userCredentials.getCredentialMetadata).toHaveBeenCalledWith(
      { userId: 'user', key: 'openbanking:synci' },
      undefined,
    );
    expect(userCredentials.getCredentials).not.toHaveBeenCalled();
  });
});
