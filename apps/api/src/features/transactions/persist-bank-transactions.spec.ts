import { describe, expect, it, vi } from 'vitest';
import { persistBankTransactions } from './persist-bank-transactions';

const row = (externalId: string) => ({
  accountId: 'local-account',
  externalId,
  amount: 1,
  currency: 'GBP',
  date: new Date('2026-01-01'),
  description: 'Purchase',
  metadata: null,
});

describe('persistBankTransactions', () => {
  it('counts only new IDs, deduplicates the batch and scopes the lookup', async () => {
    const repository = {
      find: vi.fn().mockResolvedValue([{ externalId: 'existing' }]),
      upsert: vi.fn().mockResolvedValue({}),
    };
    const count = await persistBankTransactions(
      repository as never,
      'local-account',
      [row('existing'), row('new'), row('new')],
    );
    expect(count).toBe(1);
    expect(repository.find).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ accountId: 'local-account' }),
        withDeleted: true,
      }),
    );
    expect(repository.upsert.mock.calls[0][0]).toHaveLength(2);
    expect(repository.upsert.mock.calls[0][0][0]).not.toHaveProperty(
      'categoryId',
    );
  });
  it('does not count existing uncategorized transactions again on retries', async () => {
    const repository = {
      find: vi.fn().mockResolvedValue([{ externalId: 'existing' }]),
      upsert: vi.fn().mockResolvedValue({}),
    };
    expect(
      await persistBankTransactions(repository as never, 'local-account', [
        row('existing'),
      ]),
    ).toBe(0);
  });
  it('does not report imported transactions when persistence fails', async () => {
    const repository = {
      find: vi.fn().mockResolvedValue([]),
      upsert: vi.fn().mockRejectedValue(new Error('write failed')),
    };
    await expect(
      persistBankTransactions(repository as never, 'local-account', [
        row('new'),
      ]),
    ).rejects.toThrow('write failed');
  });
  it('persists a large history in bounded writes without losing rows', async () => {
    const repository = {
      find: vi.fn().mockResolvedValue([{ externalId: '0' }]),
      upsert: vi.fn().mockResolvedValue({}),
    };
    const rows = Array.from({ length: 10001 }, (_, index) =>
      row(String(index)),
    );
    expect(
      await persistBankTransactions(repository as never, 'local-account', rows),
    ).toBe(10000);
    const batches = repository.upsert.mock.calls.map(([batch]) => batch);
    expect(batches.every((batch) => batch.length <= 1000)).toBe(true);
    expect(batches.flat()).toEqual(rows);
  });
  it('skips database operations for an empty batch', async () => {
    const repository = { find: vi.fn(), upsert: vi.fn() };
    expect(
      await persistBankTransactions(repository as never, 'local-account', []),
    ).toBe(0);
    expect(repository.find).not.toHaveBeenCalled();
    expect(repository.upsert).not.toHaveBeenCalled();
  });
});
