import { QueryClient } from '@tanstack/react-query';
import { afterEach, describe, expect, it } from 'vitest';
import {
  invalidateTransactionLists,
  updateTransactionCache,
} from './transactionCache';

describe('transaction mutation cache contracts', () => {
  let queryClient: QueryClient;

  afterEach(() => {
    queryClient?.clear();
  });

  it('updates the detail and marks filtered transaction lists stale', async () => {
    queryClient = new QueryClient();
    const listKey = ['transactions', { page: 1, accountId: 'account-a' }];
    queryClient.setQueryData(listKey, [{ id: 'transaction-1', amount: 10 }]);
    const transaction = {
      id: 'transaction-1',
      accountId: 'account-a',
      amount: 25,
      currency: 'GBP',
      date: new Date('2025-01-01T00:00:00.000Z'),
      description: 'Updated',
      notes: null,
      categoryId: null,
    };

    await updateTransactionCache(queryClient, transaction);

    expect(queryClient.getQueryData(['transactions', transaction.id])).toEqual(
      transaction,
    );
    expect(queryClient.getQueryState(listKey)?.isInvalidated).toBe(true);
  });

  it('invalidates transaction lists after a deletion', async () => {
    queryClient = new QueryClient();
    const listKey = ['transactions', { page: 1 }];
    queryClient.setQueryData(listKey, [{ id: 'transaction-1' }]);

    await invalidateTransactionLists(queryClient);

    expect(queryClient.getQueryState(listKey)?.isInvalidated).toBe(true);
  });
});
