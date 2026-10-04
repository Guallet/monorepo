import { QueryClient, QueryObserver } from '@tanstack/react-query';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { refreshTransactionsAfterCategoryDeletion } from './refreshTransactionsAfterCategoryDeletion';

describe('transaction caches after category deletion', () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  afterEach(() => client.clear());

  it('drops warm inactive transaction details and lists before they can initialize stale drafts', async () => {
    const transaction = { id: 'transaction', categoryId: 'deleted-category' };
    const keys = [
      ['transactions', transaction.id],
      ['transactions', 'filter', { categories: ['deleted-category'] }],
      ['transactions', '-inbox-infinite'],
      ['accounts-transactions', 'account'],
    ];
    for (const key of keys) client.setQueryData(key, transaction);
    client.setQueryData(['accounts', 'account'], { id: 'account' });

    await refreshTransactionsAfterCategoryDeletion(client);

    for (const key of keys) expect(client.getQueryData(key)).toBeUndefined();
    expect(client.getQueryData(['accounts', 'account'])).toEqual({
      id: 'account',
    });
  });

  it('refetches observed queries and waits for the server to clear the category', async () => {
    const key = ['transactions', 'transaction'];
    client.setQueryData(key, {
      id: 'transaction',
      categoryId: 'deleted-category',
    });
    const queryFn = vi.fn(async () => ({
      id: 'transaction',
      categoryId: null,
    }));
    const observer = new QueryObserver(client, {
      queryKey: key,
      queryFn,
      staleTime: Infinity,
    });
    const unsubscribe = observer.subscribe(() => {});
    try {
      await refreshTransactionsAfterCategoryDeletion(client);
      expect(queryFn).toHaveBeenCalledOnce();
      expect(client.getQueryData(key)).toEqual({
        id: 'transaction',
        categoryId: null,
      });
    } finally {
      unsubscribe();
    }
  });

  it('cancels an older request so its result cannot repopulate a deleted-category detail', async () => {
    const key = ['transactions', 'transaction'];
    let resolveRequest!: (value: { categoryId: string }) => void;
    let requestSignal: AbortSignal | undefined;
    const pending = client.fetchQuery({
      queryKey: key,
      queryFn: ({ signal }) => {
        requestSignal = signal;
        return new Promise<{ categoryId: string }>((resolve) => {
          resolveRequest = resolve;
        });
      },
    });
    const canceled = pending.catch(() => undefined);

    await refreshTransactionsAfterCategoryDeletion(client);
    resolveRequest({ categoryId: 'deleted-category' });
    await canceled;

    expect(requestSignal?.aborted).toBe(true);
    expect(client.getQueryData(key)).toBeUndefined();
  });
});
