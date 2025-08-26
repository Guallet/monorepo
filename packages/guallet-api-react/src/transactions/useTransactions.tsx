import { InboxTransactionDto, TransactionDto } from "@guallet/api-client";
import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useGualletClient } from "./../GualletClientProvider";

const TRANSACTIONS_QUERY_KEY = "transactions";
const TRANSACTIONS_DEFAULT_PAGE_SIZE = 50;

export function useTransactions() {
  const gualletClient = useGualletClient();

  const query = useQuery({
    queryKey: [TRANSACTIONS_QUERY_KEY],
    queryFn: async () => {
      return await gualletClient.transactions.getAll();
    },
    gcTime: 1000 * 60 * 60, // 1 Hour
    staleTime: 1000 * 60 * 60, // 1 Hour
  });

  return {
    transactions:
      query.data?.transactions.filter(
        (dto): dto is TransactionDto => dto !== undefined
      ) ?? [],
    metadata: query.data?.meta ?? null,
    ...query,
  };
}

export function useInfiniteTransactions() {
  const gualletClient = useGualletClient();

  const query = useInfiniteQuery({
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
      query.data?.pages
        .flatMap((x) => x.transactions)
        .filter((dto): dto is TransactionDto => dto !== undefined) ?? [],
    // metadata: data?.pages.pop()?.meta ?? null,
    ...query,
  };
}

export function useTransaction(id: string) {
  const gualletClient = useGualletClient();
  const query = useQuery({
    queryKey: [TRANSACTIONS_QUERY_KEY, id],
    queryFn: async () => {
      return await gualletClient.transactions.get(id);
    },
    gcTime: 1000 * 60 * 60, // 1 Hour
    staleTime: 1000 * 60 * 60, // 1 Hour
  });

  return { transaction: query.data ?? null, ...query };
}

export function useTransactionInbox() {
  const gualletClient = useGualletClient();
  const query = useQuery({
    queryKey: [TRANSACTIONS_QUERY_KEY, "inbox"],
    queryFn: async () => {
      return await gualletClient.transactions.getInbox();
    },
  });

  return {
    transactions:
      query.data?.filter(
        (dto): dto is InboxTransactionDto => dto !== undefined
      ) ?? [],
    ...query,
  };
}

export function useTransactionsWithFilter(filters: {
  page: number;
  pageSize?: number | null;
  accounts?: string[] | null;
  categories?: string[] | null;
  startDate?: Date | null;
  endDate?: Date | null;
}) {
  const gualletClient = useGualletClient();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [TRANSACTIONS_QUERY_KEY, "filter", filters],
    queryFn: async ({ queryKey }) => {
      const transactions = await gualletClient.transactions.loadTransactions({
        ...filters,
      });

      // Add the individual transactions to the cache
      transactions.transactions.forEach((transaction: TransactionDto) => {
        queryClient.setQueryData(
          [TRANSACTIONS_QUERY_KEY, transaction.id],
          transaction
        );
      });

      return transactions;
    },
  });

  return {
    transactions:
      query.data?.transactions?.filter(
        (dto: TransactionDto | undefined): dto is TransactionDto =>
          dto !== undefined
      ) ?? [],
    metadata: query.data?.meta ?? null,
    ...query,
  };
}
