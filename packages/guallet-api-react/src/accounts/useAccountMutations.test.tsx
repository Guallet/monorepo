import { beforeEach, describe, expect, it, vi } from 'vitest';

const fixture = vi.hoisted(() => {
  const mutations: Array<{
    mutationFn: (input: unknown) => Promise<unknown>;
    onSuccess: () => Promise<void>;
  }> = [];
  const client = {
    accounts: {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  };
  const invalidateQueries = vi.fn().mockResolvedValue(undefined);
  return { mutations, client, invalidateQueries };
});

vi.mock('@tanstack/react-query', () => ({
  useMutation: (options: (typeof fixture.mutations)[number]) => {
    fixture.mutations.push(options);
    return options;
  },
  useQueryClient: () => ({ invalidateQueries: fixture.invalidateQueries }),
}));
vi.mock('../GualletClientProvider', () => ({
  useGualletClient: () => fixture.client,
}));

import { useAccountMutations } from './useAccountMutations';

describe('account mutation flows', () => {
  beforeEach(() => {
    fixture.mutations.length = 0;
    fixture.client.accounts.create.mockReset();
    fixture.client.accounts.update.mockReset();
    fixture.client.accounts.delete.mockReset();
    fixture.invalidateQueries.mockClear();
  });

  it('creates, edits and deletes through the client and refreshes dependent caches', async () => {
    useAccountMutations();
    const [create, update, remove] = fixture.mutations;
    const request = { name: 'Cash', type: 'current-account', currency: 'GBP' };
    fixture.client.accounts.create.mockResolvedValue({
      id: 'account-1',
      ...request,
    });
    fixture.client.accounts.update.mockResolvedValue({
      id: 'account-1',
      ...request,
      name: 'Daily',
    });
    fixture.client.accounts.delete.mockResolvedValue(undefined);

    await create.mutationFn({ request });
    await create.onSuccess();
    await update.mutationFn({ id: 'account-1', request: { name: 'Daily' } });
    await update.onSuccess();
    await remove.mutationFn({ id: 'account-1' });
    await remove.onSuccess();

    expect(fixture.client.accounts.create).toHaveBeenCalledWith(request);
    expect(fixture.client.accounts.update).toHaveBeenCalledWith('account-1', {
      name: 'Daily',
    });
    expect(fixture.client.accounts.delete).toHaveBeenCalledWith('account-1');
    for (const key of [
      'accounts',
      'accounts-charts',
      'accounts-transactions',
      'transactions',
      'reports',
    ]) {
      expect(fixture.invalidateQueries).toHaveBeenCalledWith({
        queryKey: [key],
      });
    }
    expect(fixture.invalidateQueries).toHaveBeenCalledTimes(15);
  });
});
