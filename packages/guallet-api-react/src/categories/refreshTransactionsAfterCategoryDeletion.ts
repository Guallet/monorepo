import type { QueryClient } from '@tanstack/react-query';

export async function refreshTransactionsAfterCategoryDeletion(
  queryClient: QueryClient,
): Promise<void> {
  const queryKeys = [['transactions'], ['accounts-transactions']];
  // Prevent requests started before deletion from restoring the old category.
  await Promise.all(
    queryKeys.map((queryKey) => queryClient.cancelQueries({ queryKey })),
  );
  // A cached detail would initialize an edit draft before its refetch finishes.
  // Drop inactive data so returning screens load the current server state.
  for (const queryKey of queryKeys) {
    queryClient.removeQueries({ queryKey, type: 'inactive' });
  }
  await Promise.all(
    queryKeys.map((queryKey) => queryClient.invalidateQueries({ queryKey })),
  );
}
