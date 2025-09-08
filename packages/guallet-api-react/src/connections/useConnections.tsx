import { ObConnection } from "@guallet/api-client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useGualletClient } from "./../GualletClientProvider";

const CONNECTIONS_QUERY_KEY = "connections";

export function useOpenBankingConnections() {
  const gualletClient = useGualletClient();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [CONNECTIONS_QUERY_KEY],
    queryFn: async () => {
      const connections = await gualletClient.connections.getAll();

      // Add the individual connections to the connections cache
      connections.forEach((connection) => {
        queryClient.setQueryData(
          [CONNECTIONS_QUERY_KEY, connection.id],
          connection
        );
      });

      return connections;
    },
  });

  return {
    connections:
      query.data?.filter((dto): dto is ObConnection => dto !== undefined) ?? [],
    ...query,
  };
}

export function useOpenBankingConnection(id: string) {
  const gualletClient = useGualletClient();

  const query = useQuery({
    queryKey: [CONNECTIONS_QUERY_KEY, id],
    queryFn: async () => {
      return await gualletClient.connections.get(id);
    },
  });

  return { connection: query.data ?? null, ...query };
}

export function useOpenBankingInstitution(institutionId: string) {
  const gualletClient = useGualletClient();

  const query = useQuery({
    queryKey: [CONNECTIONS_QUERY_KEY, "institutions", institutionId],
    queryFn: async () => {
      return await gualletClient.connections.getInstitutionDetails(
        institutionId
      );
    },
  });

  return { institution: query.data ?? null, ...query };
}
