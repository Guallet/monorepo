import { gualletClient } from "@/api/gualletClient";
import { AccountDto } from "@guallet/api-client";
import { useQuery } from "@tanstack/react-query";

const ACCOUNTS_QUERY_KEY = "accounts";

export function useAccounts() {
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
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: [ACCOUNTS_QUERY_KEY, id],
    queryFn: async () => {
      return await gualletClient.accounts.get(id);
    },
  });

  return { account: data, isLoading, refetch, isFetching };
}

// export function useAccountsF(){
//     const results = useQueries({
//         queries: [
//           { queryKey: ['post', 1], queryFn: fetchPost, staleTime: Infinity },
//           { queryKey: ['post', 2], queryFn: fetchPost, staleTime: Infinity },
//         ],
//       })
// }
