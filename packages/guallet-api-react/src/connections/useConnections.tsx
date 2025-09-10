import {
  ObAccountDto,
  ObConnection,
  ObInstitutionDto,
  OpenBankingCountryDto,
} from "@guallet/api-client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useGualletClient } from "./../GualletClientProvider";

const CONNECTIONS_QUERY_KEY = "connections";

export function useOpenBankingSupportedCountries() {
  const gualletClient = useGualletClient();

  const query = useQuery({
    queryKey: [CONNECTIONS_QUERY_KEY, "countries"],
    queryFn: async () => {
      return await gualletClient.connections.getSupportedCountries();
    },
  });

  return {
    countries:
      query.data
        ?.filter((dto): dto is OpenBankingCountryDto => dto !== undefined)
        .toSorted((a, b) => a.name.localeCompare(b.name)) ?? [],
    ...query,
  };
}

export function useOpenBankingInstitutionsForCountry(countryCode?: string) {
  const gualletClient = useGualletClient();

  const query = useQuery({
    queryKey: [CONNECTIONS_QUERY_KEY, "countries", countryCode],
    enabled: !!countryCode,
    queryFn: async () => {
      return await gualletClient.connections.getInstitutionsForCountry(
        countryCode!
      );
    },
  });

  return {
    institutions:
      query.data
        ?.filter((dto): dto is ObInstitutionDto => dto !== undefined)
        .toSorted((a, b) => a.name.localeCompare(b.name)) ?? [],
    ...query,
  };
}

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

export function useOpenBankingAccountsForConnection(
  connectionId: string | null | undefined
) {
  const gualletClient = useGualletClient();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [CONNECTIONS_QUERY_KEY],
    enabled: !!connectionId,
    queryFn: async () => {
      const connections = await gualletClient.connections.getConnectionAccounts(
        { connectionId: connectionId! }
      );

      // Add the individual connections to the connections cache
      connections.forEach((connection) => {
        queryClient.setQueryData(
          [CONNECTIONS_QUERY_KEY, connection.id, "accounts"],
          connection
        );
      });

      return connections;
    },
  });

  return {
    accounts:
      query.data?.filter((dto): dto is ObAccountDto => dto !== undefined) ?? [],
    ...query,
  };
}

export function useOpenBankingInstitution(
  institutionId: string | null | undefined
) {
  const gualletClient = useGualletClient();

  const query = useQuery({
    queryKey: [CONNECTIONS_QUERY_KEY, "institutions", institutionId],
    enabled: !!institutionId,
    queryFn: async () => {
      return await gualletClient.connections.getInstitutionDetails(
        institutionId!
      );
    },
  });

  return { institution: query.data ?? null, ...query };
}
