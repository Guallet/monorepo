import { AccountDto } from "@guallet/api-client";
import { useQuery } from "@tanstack/react-query";
import { useGualletClient } from "./../GualletClientProvider";

const ACCOUNTS_QUERY_KEY = "accounts";

export function useAccounts() {
  const gualletClient = useGualletClient();

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: [ACCOUNTS_QUERY_KEY],
    queryFn: async () => {
      return await gualletClient.accounts.getAll();
    },
  });

  return {
    accounts: data?.filter((dto): dto is AccountDto => dto !== undefined) ?? [],
    isLoading,
    refetch,
    isFetching,
  };
}

export function useAccount(id: string) {
  const gualletClient = useGualletClient();

  const { data, isLoading, isFetching, refetch, error, isError } = useQuery({
    queryKey: [ACCOUNTS_QUERY_KEY, id],
    queryFn: async () => {
      return await gualletClient.accounts.get(id);
    },
  });

  return {
    account: data ?? null,
    isLoading,
    refetch,
    isFetching,
    error,
    isError,
  };
}
