import { beforeEach, describe, expect, it, vi } from 'vitest';

const fixture = vi.hoisted(() => {
  const queries: Array<{
    queryKey: unknown[];
    enabled?: boolean;
    queryFn: () => Promise<unknown>;
  }> = [];
  const client = { accounts: { getAll: vi.fn(), get: vi.fn() } };
  return { queries, client };
});
vi.mock('@tanstack/react-query', () => ({
  useQuery: (options: (typeof fixture.queries)[number]) => {
    fixture.queries.push(options);
    return { data: null, isLoading: false };
  },
}));
vi.mock('../GualletClientProvider', () => ({
  useGualletClient: () => fixture.client,
}));

import { useAccount, useAccounts } from './useAccounts';

describe('account list and detail queries', () => {
  beforeEach(() => {
    fixture.queries.length = 0;
    fixture.client.accounts.getAll.mockReset();
    fixture.client.accounts.get.mockReset();
  });

  it('loads the list and a user-selected detail by distinct keys', async () => {
    fixture.client.accounts.getAll.mockResolvedValue([{ id: 'one' }]);
    fixture.client.accounts.get.mockResolvedValue({ id: 'one', name: 'Cash' });
    useAccounts();
    useAccount('one');
    expect(fixture.queries.map((query) => query.queryKey)).toEqual([
      ['accounts'],
      ['accounts', 'one'],
    ]);
    expect(await fixture.queries[0].queryFn()).toEqual([{ id: 'one' }]);
    expect(await fixture.queries[1].queryFn()).toEqual({
      id: 'one',
      name: 'Cash',
    });
    expect(fixture.client.accounts.get).toHaveBeenCalledWith('one');
  });

  it('does not fetch detail before an account id is available', () => {
    useAccount('');
    expect(fixture.queries[0].enabled).toBe(false);
  });
});
