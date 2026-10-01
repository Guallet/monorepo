import { beforeEach, describe, expect, it, vi } from 'vitest';

const fixture = vi.hoisted(() => {
  const mutations: Array<{ onSuccess: () => Promise<void> }> = [];
  const invalidateQueries = vi.fn().mockResolvedValue(undefined);
  return { mutations, invalidateQueries };
});

vi.mock('@tanstack/react-query', () => ({
  useMutation: (options: (typeof fixture.mutations)[number]) => {
    fixture.mutations.push(options);
    return options;
  },
  useQueryClient: () => ({ invalidateQueries: fixture.invalidateQueries }),
}));
vi.mock('../GualletClientProvider', () => ({
  useGualletClient: () => ({ accounts: {} }),
}));

import { useAccountMutations } from './useAccountMutations';

describe('saving goal refresh after account changes', () => {
  beforeEach(() => {
    fixture.mutations.length = 0;
    fixture.invalidateQueries.mockClear();
  });

  it('refreshes goal progress after creating, updating, or deleting an account', async () => {
    useAccountMutations();
    for (const mutation of fixture.mutations) await mutation.onSuccess();
    expect(fixture.invalidateQueries).toHaveBeenCalledTimes(6);
    expect(fixture.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['savingGoals'],
    });
  });
});
