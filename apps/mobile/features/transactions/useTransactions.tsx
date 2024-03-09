import { gualletClient } from "@/api/gualletClient";
import { TransactionDto } from "@guallet/api-client";
import { useQuery } from "@tanstack/react-query";

const TRANSACTIONS_QUERY_KEY = "transactions";

export function useTransactions() {
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: [TRANSACTIONS_QUERY_KEY],
    queryFn: async () => {
      return await gualletClient.transactions.getAll();
    },
  });

  return {
    transactions:
      data?.filter((dto): dto is TransactionDto => dto !== undefined) ?? [],
    isLoading,
    refetch,
    isFetching,
  };
}

export function useTransaction(id: string) {
  const { data, isLoading, isFetching, refetch, error } = useQuery({
    queryKey: [TRANSACTIONS_QUERY_KEY, id],
    queryFn: async () => {
      return await gualletClient.transactions.get(id);
    },
  });

  return { transaction: data ?? null, isLoading, refetch, isFetching, error };
}
