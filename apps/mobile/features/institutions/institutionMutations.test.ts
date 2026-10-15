import { beforeEach, describe, expect, it, vi } from 'vitest';
import type {
  InstitutionDto,
  UpdateInstitutionRequest,
} from '@guallet/api-client';
import { useInstitutionMutations } from '../../../../packages/guallet-api-react/src/institutions/useInstitutionMutations';
const mocks = vi.hoisted(() => ({
  mutation: vi.fn((options: unknown) => options),
  invalidateQueries: vi.fn().mockResolvedValue(undefined),
  setQueryData: vi.fn(),
  removeQueries: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
  accountUpdate: vi.fn(),
}));
vi.mock('@tanstack/react-query', () => ({
  useMutation: mocks.mutation,
  useQueryClient: () => mocks,
}));
vi.mock(
  '../../../../packages/guallet-api-react/src/GualletClientProvider',
  () => ({
    useGualletClient: () => ({
      institutions: {
        create: mocks.create,
        update: mocks.update,
        delete: mocks.remove,
      },
      accounts: { update: mocks.accountUpdate },
    }),
  }),
);
type UpdateOptions = {
  mutationFn: (args: {
    id: string;
    request: UpdateInstitutionRequest;
  }) => Promise<InstitutionDto>;
  onSuccess: (institution: InstitutionDto) => void;
};
type DeleteOptions = {
  mutationFn: (args: { id: string }) => Promise<void>;
  onSuccess: (result: undefined, args: { id: string }) => void;
};
beforeEach(() => vi.clearAllMocks());
describe('Institution mutation hooks', () => {
  it('updates the institution endpoint and refreshes both detail and list caches', async () => {
    useInstitutionMutations();
    const options = mocks.mutation.mock.calls[1]?.[0] as UpdateOptions;
    const institution: InstitutionDto = {
      id: 'bank',
      name: 'Bank',
      user_id: 'user',
      countries: [],
    };
    mocks.update.mockResolvedValue(institution);
    const updated = await options.mutationFn({
      id: 'bank',
      request: { name: 'Bank' },
    });
    options.onSuccess(updated);
    expect(mocks.update).toHaveBeenCalledWith('bank', { name: 'Bank' });
    expect(mocks.accountUpdate).not.toHaveBeenCalled();
    expect(mocks.setQueryData).toHaveBeenCalledWith(
      ['institutions', 'bank'],
      institution,
    );
    expect(mocks.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['institutions'],
    });
  });
  it('removes only the deleted detail cache and refreshes the list', async () => {
    useInstitutionMutations();
    const options = mocks.mutation.mock.calls[2]?.[0] as DeleteOptions;
    await options.mutationFn({ id: 'bank' });
    options.onSuccess(undefined, { id: 'bank' });
    expect(mocks.remove).toHaveBeenCalledWith('bank');
    expect(mocks.removeQueries).toHaveBeenCalledWith({
      queryKey: ['institutions', 'bank'],
      exact: true,
    });
    expect(mocks.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['institutions'],
    });
  });
});
