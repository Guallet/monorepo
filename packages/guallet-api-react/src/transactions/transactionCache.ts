import type { QueryClient } from '@tanstack/react-query';
import type { TransactionDto } from '@guallet/api-client';

const TRANSACTIONS_QUERY_KEY = 'transactions';

export async function updateTransactionCache(
  queryClient: QueryClient,
  transaction: TransactionDto,
): Promise<void> {
  queryClient.setQueryData(
    [TRANSACTIONS_QUERY_KEY, transaction.id],
    transaction,
  );
  await queryClient.invalidateQueries({
    queryKey: [TRANSACTIONS_QUERY_KEY],
  });
}

export async function invalidateTransactionLists(
  queryClient: QueryClient,
): Promise<void> {
  await queryClient.invalidateQueries({
    queryKey: [TRANSACTIONS_QUERY_KEY],
  });
}
