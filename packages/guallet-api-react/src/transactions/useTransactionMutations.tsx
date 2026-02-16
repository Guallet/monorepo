import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useGualletClient } from "./../GualletClientProvider";
import {
  CreateTransactionRequest,
  UpdateTransactionRequest,
} from "@guallet/api-client";

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
    onSuccess: async () => {
      queryClient.invalidateQueries({
        queryKey: [TRANSACTIONS_QUERY_KEY],
      });
    },
    onError: async (error, variables, context) => {
      console.error(error);
    },
  });

  const updateTransactionCategoryMutation = useMutation({
    mutationFn: async ({ id, categoryId }: { id: string; categoryId: string }) => {
      return await gualletClient.transactions.updateTransactionCategory({
        transactionId: id,
        categoryId,
      });
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({
        queryKey: [TRANSACTIONS_QUERY_KEY],
      });
    },
    onError: async (error, variables, context) => {
      console.error(error);
    },
  });

  const updateTransactionMutation = useMutation({
    mutationFn: async ({ id, request }: { id: string; request: UpdateTransactionRequest }) => {
      return await gualletClient.transactions.update({
        transactionId: id,
        request,
      });
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({
        queryKey: [TRANSACTIONS_QUERY_KEY],
      });
    },
    onError: async (error, variables, context) => {
      console.error(error);
    },
  });

  const deleteTransactionMutation = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      return await gualletClient.transactions.delete(id);
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({
        queryKey: [TRANSACTIONS_QUERY_KEY],
      });
    },
    onError: async (error, variables, context) => {
      console.error(error);
    },
  });

  return {
    createTransactionMutation,
    updateTransactionNotesMutation,
    updateTransactionCategoryMutation,
    updateTransactionMutation,
    deleteTransactionMutation,
  };
}
