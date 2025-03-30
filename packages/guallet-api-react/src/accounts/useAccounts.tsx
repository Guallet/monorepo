import { AccountDto } from "@guallet/api-client";
import { useQuery } from "@tanstack/react-query";
import { useGualletClient } from "./../GualletClientProvider";

const ACCOUNTS_QUERY_KEY = "accounts";

export function useAccounts() {
  const gualletClient = useGualletClient();

  const query = useQuery({
    queryKey: [ACCOUNTS_QUERY_KEY],
    queryFn: async () => {
      return await gualletClient.accounts.getAll();
    },
  });

  return {
    accounts:
      query.data?.filter((dto): dto is AccountDto => dto !== undefined) ?? [],
    ...query,
  };
}

export function useAccount(id: string) {
  const gualletClient = useGualletClient();

  const query = useQuery({
    queryKey: [ACCOUNTS_QUERY_KEY, id],
    queryFn: async () => {
      return await gualletClient.accounts.get(id);
    },
  });

  return {
    account: query.data ?? null,
    ...query,
  };
}
