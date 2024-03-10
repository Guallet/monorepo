import { gualletClient } from "@/api/gualletClient";
import {
  AccountDto,
  GualletInstitutionDto,
  InstitutionDto,
  ObConnection,
} from "@guallet/api-client";
import { useQuery } from "@tanstack/react-query";

const CONNECTIONS_QUERY_KEY = "connections";

export function useOpenBankingConnections() {
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: [CONNECTIONS_QUERY_KEY],
    queryFn: async () => {
      return await gualletClient.connections.getAll();
    },
  });

  return {
    connections:
      data?.filter((dto): dto is ObConnection => dto !== undefined) ?? [],
    isLoading,
    refetch,
    isFetching,
  };
}

export function useOpenBankingConnection(id: string) {
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: [CONNECTIONS_QUERY_KEY, id],
    queryFn: async () => {
      return await gualletClient.connections.get(id);
    },
  });

  return { connection: data ?? null, isLoading, refetch, isFetching };
}

export function useOpenBankingInstitution(institutionId: string) {
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: [CONNECTIONS_QUERY_KEY, "institutions", institutionId],
    queryFn: async () => {
      return await gualletClient.connections.getInstitutionDetails(
        institutionId
      );
    },
  });

  return { institution: data ?? null, isLoading, refetch, isFetching };
}

// export function useAccountsF(){
//     const results = useQueries({
//         queries: [
//           { queryKey: ['post', 1], queryFn: fetchPost, staleTime: Infinity },
//           { queryKey: ['post', 2], queryFn: fetchPost, staleTime: Infinity },
//         ],
//       })
// }
