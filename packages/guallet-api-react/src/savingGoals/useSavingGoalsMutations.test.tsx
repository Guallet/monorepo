import { beforeEach, describe, expect, it, vi } from 'vitest';

const fixture = vi.hoisted(() => {
  const mutations: Array<{
    mutationFn: (input: unknown) => Promise<unknown>;
    onSuccess: (
      data: { id: string },
      variables: { id: string },
    ) => Promise<void>;
  }> = [];
  const savingGoals = { create: vi.fn(), update: vi.fn(), delete: vi.fn() };
  const invalidateQueries = vi.fn().mockResolvedValue(undefined);
  const setQueryData = vi.fn();
  const removeQueries = vi.fn();
  return {
    mutations,
    savingGoals,
    invalidateQueries,
    setQueryData,
    removeQueries,
  };
});

vi.mock('@tanstack/react-query', () => ({
  useMutation: (options: (typeof fixture.mutations)[number]) => {
    fixture.mutations.push(options);
    return options;
  },
  useQueryClient: () => ({
    invalidateQueries: fixture.invalidateQueries,
    setQueryData: fixture.setQueryData,
    removeQueries: fixture.removeQueries,
  }),
}));
vi.mock('../GualletClientProvider', () => ({
  useGualletClient: () => ({ savingGoals: fixture.savingGoals }),
}));

import { useSavingGoalMutations } from './useSavingGoalsMutations';

describe('saving goal CRUD cache updates', () => {
  beforeEach(() => {
    fixture.mutations.length = 0;
    vi.clearAllMocks();
  });

  it('creates, updates, and deletes goals while refreshing the list', async () => {
    useSavingGoalMutations();
    const [create, update, remove] = fixture.mutations;
    const request = { name: 'Trip', targetAmount: 1000, accounts: ['a'] };
    const goal = { id: 'g' };
    fixture.savingGoals.create.mockResolvedValue(goal);
    fixture.savingGoals.update.mockResolvedValue(goal);
    fixture.savingGoals.delete.mockResolvedValue(goal);

    await create.mutationFn({ request });
    await create.onSuccess(goal, { id: 'g' });
    await update.mutationFn({ id: 'g', request: { name: 'Holiday' } });
    await update.onSuccess(goal, { id: 'g' });
    await remove.mutationFn({ id: 'g' });
    await remove.onSuccess(goal, { id: 'g' });

    expect(fixture.savingGoals.create).toHaveBeenCalledWith(request);
    expect(fixture.savingGoals.update).toHaveBeenCalledWith('g', {
      name: 'Holiday',
    });
    expect(fixture.savingGoals.delete).toHaveBeenCalledWith('g');
    expect(fixture.setQueryData).toHaveBeenCalledWith(
      ['savingGoals', 'g'],
      goal,
    );
    expect(fixture.removeQueries).toHaveBeenCalledWith({
      queryKey: ['savingGoals', 'g'],
    });
    expect(fixture.invalidateQueries).toHaveBeenCalledTimes(3);
    expect(fixture.invalidateQueries).toHaveBeenLastCalledWith({
      queryKey: ['savingGoals'],
      exact: true,
    });
  });
});
