import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useGualletClient } from "../GualletClientProvider";
import { CreateBudgetRequest, UpdateBudgetRequest } from "@guallet/api-client";

const BUDGETS_QUERY_KEY = "budgets";

export function useBudgetMutations() {
  const queryClient = useQueryClient();
  const gualletClient = useGualletClient();

  const createBudgetMutation = useMutation({
    mutationFn: async ({ request }: { request: CreateBudgetRequest }) => {
      return await gualletClient.budgets.create({ request });
    },
    onSuccess: async (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [BUDGETS_QUERY_KEY],
      });
    },
    onError: async (error, variables, context) => {
      console.error(error);
    },
  });

  const updateBudgetMutation = useMutation({
    mutationFn: async ({
      id,
      request,
    }: {
      id: string;
      request: UpdateBudgetRequest;
    }) => {
      return await gualletClient.budgets.update({
        budgetId: id,
        budget: request,
      });
    },
    onSuccess: async (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [BUDGETS_QUERY_KEY],
      });
    },
    onError: async (error, variables, context) => {
      console.error(error);
    },
  });

  const deleteBudgetMutation = useMutation({
    mutationFn: async (id: string) => {
      return await gualletClient.budgets.delete({ budgetId: id });
    },
    onSuccess: async (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [BUDGETS_QUERY_KEY],
      });
    },
    onError: async (error, variables, context) => {
      console.error(error);
    },
  });

  return {
    createBudgetMutation,
    updateBudgetMutation,
    deleteBudgetMutation,
  };
}
