import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useGualletClient } from "./../GualletClientProvider";
import { CreateTransactionRequest } from "@guallet/api-client";

const TRANSACTIONS_QUERY_KEY = "transactions";

export function useTransactionMutations() {
  const gualletClient = useGualletClient();
  const queryClient = useQueryClient();

  const createTransactionMutation = useMutation({
    mutationFn: async (request: CreateTransactionRequest) => {
      return await gualletClient.transactions.create({
        request,
      });
    },
    onSuccess: async (data, variables) => {
      // Add the new transaction to the cache
      queryClient.setQueryData([TRANSACTIONS_QUERY_KEY, data.id], data);
    },
    onError: async (error, variables, context) => {
      console.error(error);
    },
  });

  const updateTransactionNotesMutation = useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes: string }) => {
      return await gualletClient.transactions.updateTransactionNotes({
        transactionId: id,
        notes,
      });
    },
    onSuccess: async (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [TRANSACTIONS_QUERY_KEY, variables.id],
      });
    },
    onError: async (error, variables, context) => {
      console.error(error);
    },
  });

  return {
    createTransactionMutation,
    updateTransactionNotesMutation,
  };
}
