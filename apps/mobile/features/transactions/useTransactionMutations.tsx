import { gualletClient } from "@/api/gualletClient";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const TRANSACTIONS_QUERY_KEY = "transactions";

export function useTransactionMutations() {
  const queryClient = useQueryClient();

  return {
    updateTransactionNotes: async (id: string, notes: string) => {
      try {
        const result = await gualletClient.transactions.updateTransactionNotes({
          transactionId: id,
          notes,
        });

        queryClient.invalidateQueries({
          queryKey: [TRANSACTIONS_QUERY_KEY, id],
        });
      } catch (error) {
        console.error(error);
      }
    },
  };
}
