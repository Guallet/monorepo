import { useQuery } from "@tanstack/react-query";
import { useGualletClient } from "./../GualletClientProvider";
import { TransactionDto } from "@guallet/api-client";

const ACCOUNT_TRANSACTIONS_QUERY_KEY = "accounts-transactions";

export function useAccountTransactions(accountId: string) {
  const gualletClient = useGualletClient();

  const query = useQuery({
    queryKey: [ACCOUNT_TRANSACTIONS_QUERY_KEY, accountId],
    queryFn: async () => {
      return await gualletClient.accounts.getAccountTransactions(accountId);
    },
  });

  return {
    transactions:
      query.data?.filter((dto): dto is TransactionDto => dto !== undefined) ??
      [],
    ...query,
  };
}
