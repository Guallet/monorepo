import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useGualletClient } from "./../GualletClientProvider";
import {
  CreateRecurringPaymentRequest,
  UpdateRecurringPaymentRequest,
} from "@guallet/api-client/src/recurringPayments";

const RECURRING_PAYMENTS_QUERY_KEY = "recurringPayments";

export function useRecurringPaymentMutations() {
  const queryClient = useQueryClient();
  const gualletClient = useGualletClient();

  const createRecurringPaymentMutation = useMutation({
    mutationFn: async ({
      request,
    }: {
      request: CreateRecurringPaymentRequest;
    }) => {
      return await gualletClient.recurringPayments.create(request);
    },
    onSuccess: async (data, variables) => {
      queryClient.setQueryData([RECURRING_PAYMENTS_QUERY_KEY, data.id], data);
      // Invalidate the list to refetch
      queryClient.invalidateQueries({
        queryKey: [RECURRING_PAYMENTS_QUERY_KEY],
      });
    },
    onError: async (error, variables, context) => {
      console.error(error);
    },
  });

  const updateRecurringPaymentMutation = useMutation({
    mutationFn: async ({
      id,
      request,
    }: {
      id: string;
      request: UpdateRecurringPaymentRequest;
    }) => {
      return await gualletClient.recurringPayments.update(id, request);
    },
    onSuccess: async (data, variables) => {
      queryClient.setQueryData([RECURRING_PAYMENTS_QUERY_KEY, data.id], data);
      // Invalidate the list to refetch
      queryClient.invalidateQueries({
        queryKey: [RECURRING_PAYMENTS_QUERY_KEY],
      });
    },
    onError: async (error, variables, context) => {
      console.error(error);
    },
  });

  const deleteRecurringPaymentMutation = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      return await gualletClient.recurringPayments.delete(id);
    },
    onSuccess: async (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [RECURRING_PAYMENTS_QUERY_KEY],
      });
    },
    onError: async (error, variables, context) => {
      console.error(error);
    },
  });

  return {
    createRecurringPaymentMutation,
    updateRecurringPaymentMutation,
    deleteRecurringPaymentMutation,
  };
}
