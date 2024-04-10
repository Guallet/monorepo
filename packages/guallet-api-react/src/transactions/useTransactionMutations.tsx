import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useGualletClient } from "./../GualletClientProvider";

const TRANSACTIONS_QUERY_KEY = "transactions";

export function useTransactionMutations() {
  const gualletClient = useGualletClient();
  const queryClient = useQueryClient();

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
    updateTransactionNotesMutation,
    // updateTransactionNotes: async (id: string, notes: string) => {
    //   try {
    //     const result = await gualletClient.transactions.updateTransactionNotes({
    //       transactionId: id,
    //       notes,
    //     });

    //     queryClient.invalidateQueries({
    //       queryKey: [TRANSACTIONS_QUERY_KEY, id],
    //     });
    //   } catch (error) {
    //     console.error(error);
    //   }
    // },
  };
}
