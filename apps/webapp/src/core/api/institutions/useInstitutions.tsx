import { InstitutionDto } from "@guallet/api-client/src/institutions";
import { useQueries, useQuery } from "@tanstack/react-query";
import { gualletClient } from "../gualletClient";

const INSTITUTIONS_QUERY_KEY = "institutions";

export function useAllInstitutions() {
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: [INSTITUTIONS_QUERY_KEY],
    queryFn: async () => {
      return await gualletClient.institutions.getAll();
    },
    staleTime: Infinity,
    gcTime: Infinity,
  });

  return { institutions: data ?? null, isLoading, refetch, isFetching };
}

export function useInstitution(id: string | null | undefined) {
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: [INSTITUTIONS_QUERY_KEY, id],
    enabled: !!id,
    queryFn: async () => {
      return await gualletClient.institutions.get(id!);
    },
    staleTime: Infinity,
    gcTime: Infinity,
  });

  return { institution: data ?? null, isLoading, refetch, isFetching };
}

export function useInstitutions(ids: string[]) {
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
  };
}
