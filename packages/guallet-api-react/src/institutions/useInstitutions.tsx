import { InstitutionDto } from "@guallet/api-client/src/institutions";
import { useQueries, useQuery } from "@tanstack/react-query";
import { useGualletClient } from "./../GualletClientProvider";

const INSTITUTIONS_QUERY_KEY = "institutions";

export function useAllInstitutions() {
  const gualletClient = useGualletClient();

  const query = useQuery({
    queryKey: [INSTITUTIONS_QUERY_KEY],
    queryFn: async () => {
      return await gualletClient.institutions.getAll();
    },
    staleTime: Infinity,
    gcTime: Infinity,
  });

  return { institutions: query.data ?? null, ...query };
}

export function useInstitution(id: string | null | undefined) {
  const gualletClient = useGualletClient();

  const query = useQuery({
    queryKey: [INSTITUTIONS_QUERY_KEY, id],
    enabled: !!id,
    queryFn: async () => {
      return await gualletClient.institutions.get(id!);
    },
    staleTime: Infinity,
    gcTime: Infinity,
  });

  return { institution: query.data ?? null, ...query };
}

export function useInstitutions(ids: string[]) {
  const gualletClient = useGualletClient();

  if (ids.length === 0)
    return {
      accounts: [],
      isLoading: false,
      refetch: () => {},
      isFetching: false,
    };
  const results = useQueries({
    queries: ids.map((id) => ({
      queryKey: [INSTITUTIONS_QUERY_KEY, id],
      queryFn: async () => {
        return await gualletClient.institutions.get(id);
      },
      staleTime: Infinity,
      gcTime: Infinity,
    })),
  });

  return {
    institutions: results
      .map((q) => q.data)
      .filter((dto): dto is InstitutionDto => dto !== undefined),
    isLoading: results.some((r) => r.isLoading),
    errors: results.find((r) => r.error) ?? null,
    ...results,
  };
}
