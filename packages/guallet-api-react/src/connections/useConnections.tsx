import { ObConnection } from "@guallet/api-client";
import { useQuery } from "@tanstack/react-query";
import { useGualletClient } from "./../GualletClientProvider";

const CONNECTIONS_QUERY_KEY = "connections";

export function useOpenBankingConnections() {
  const gualletClient = useGualletClient();

  const query = useQuery({
    queryKey: [CONNECTIONS_QUERY_KEY],
    queryFn: async () => {
      return await gualletClient.connections.getAll();
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
