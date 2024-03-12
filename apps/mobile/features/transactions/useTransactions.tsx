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
    gcTime: 1000 * 60 * 60, // 1 Hour
    staleTime: 1000 * 60 * 60, // 1 Hour
  });

  return {
    transactions:
      data?.transactions.filter(
        (dto): dto is TransactionDto => dto !== undefined
      ) ?? [],
    metadata: data?.meta ?? null,
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
    gcTime: 1000 * 60 * 60, // 1 Hour
    staleTime: 1000 * 60 * 60, // 1 Hour
  });

  return { transaction: data ?? null, isLoading, refetch, isFetching, error };
}