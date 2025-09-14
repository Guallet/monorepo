import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useGualletClient } from "./../GualletClientProvider";
import {
  CreateSavingGoalRequest,
  UpdateSavingGoalRequest,
} from "@guallet/api-client/src/savingGoals";

const SAVING_GOALS_QUERY_KEY = "savingGoals";

export function useSavingGoalMutations() {
  const queryClient = useQueryClient();
  const gualletClient = useGualletClient();

  const createSavingGoalMutation = useMutation({
    mutationFn: async ({ request }: { request: CreateSavingGoalRequest }) => {
      return await gualletClient.savingGoals.create(request);
    },
    onSuccess: async (data, variables) => {
      queryClient.setQueryData([SAVING_GOALS_QUERY_KEY, data.id], data);
    },
    onError: async (error, variables, context) => {
      console.error(error);
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
    onSuccess: async (data, variables) => {
      queryClient.setQueryData([SAVING_GOALS_QUERY_KEY, data.id], data);
    },
    onError: async (error, variables, context) => {
      console.error(error);
    },
  });

  const deleteSavingGoalMutation = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      return await gualletClient.savingGoals.delete(id);
    },
    onSuccess: async (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [SAVING_GOALS_QUERY_KEY],
      });
    },
    onError: async (error, variables, context) => {
      console.error(error);
    },
  });

  return {
    createSavingGoalMutation,
    updateSavingGoalMutation,
    deleteSavingGoalMutation,
  };
}
