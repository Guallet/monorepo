import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useGualletClient } from './../GualletClientProvider';
import {
  CreateSavingGoalRequest,
  UpdateSavingGoalRequest,
} from '@guallet/api-client/src/savingGoals';

const SAVING_GOALS_QUERY_KEY = 'savingGoals';

export function useSavingGoalMutations() {
  const queryClient = useQueryClient();
  const gualletClient = useGualletClient();

  const createSavingGoalMutation = useMutation({
    mutationFn: async ({ request }: { request: CreateSavingGoalRequest }) => {
      return await gualletClient.savingGoals.create(request);
    },
    onSuccess: async (data) => {
      queryClient.setQueryData([SAVING_GOALS_QUERY_KEY, data.id], data);
      await queryClient.invalidateQueries({
        queryKey: [SAVING_GOALS_QUERY_KEY],
      });
    },
  });

  const updateSavingGoalMutation = useMutation({
    mutationFn: async ({
      id,
      request,
    }: {
      id: string;
      request: UpdateSavingGoalRequest;
    }) => {
      return await gualletClient.savingGoals.update(id, request);
    },
    onSuccess: async (data) => {
      queryClient.setQueryData([SAVING_GOALS_QUERY_KEY, data.id], data);
      await queryClient.invalidateQueries({
        queryKey: [SAVING_GOALS_QUERY_KEY],
      });
    },
  });

  const deleteSavingGoalMutation = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      return await gualletClient.savingGoals.delete(id);
    },
    onSuccess: async (_data, variables) => {
      queryClient.removeQueries({
        queryKey: [SAVING_GOALS_QUERY_KEY, variables.id],
      });
      await queryClient.invalidateQueries({
        queryKey: [SAVING_GOALS_QUERY_KEY],
        exact: true,
      });
    },
  });

  return {
    createSavingGoalMutation,
    updateSavingGoalMutation,
    deleteSavingGoalMutation,
  };
}
