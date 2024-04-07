import { gualletClient } from "@api/gualletClient";
import { InboxTransactionDto, TransactionDto } from "@guallet/api-client";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

const TRANSACTIONS_QUERY_KEY = "transactions";
const TRANSACTIONS_DEFAULT_PAGE_SIZE = 50;

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

export function useInfiniteTransactions() {
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: [TRANSACTIONS_QUERY_KEY + "-infinite"],
    queryFn: async ({ pageParam }) => {
      console.log("queryFn", pageParam);
      return await gualletClient.transactions.loadTransactions({
        page: pageParam,
        pageSize: TRANSACTIONS_DEFAULT_PAGE_SIZE,
      });
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, pages) => {
      console.log("getNextPageParam", lastPage);
      console.log("getNextPageParam: pages", pages);
      if (lastPage === undefined) return undefined;
      const { meta } = lastPage;
      if (meta.hasMore) {
        return meta.page + 1;
      } else {
        // No more pages
        return undefined;
      }
    },
  });

  return {
    transactions:
      data?.pages
        .flatMap((x) => x.transactions)
        .filter((dto): dto is TransactionDto => dto !== undefined) ?? [],
    // metadata: data?.pages.pop()?.meta ?? null,
    error,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    status,
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

export function useTransactionInbox() {
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: [TRANSACTIONS_QUERY_KEY, "inbox"],
    queryFn: async () => {
      return await gualletClient.transactions.getInbox();
    },
  });

  return {
    transactions:
      data?.filter((dto): dto is InboxTransactionDto => dto !== undefined) ??
      [],
    isLoading,
    refetch,
    isFetching,
  };
}
