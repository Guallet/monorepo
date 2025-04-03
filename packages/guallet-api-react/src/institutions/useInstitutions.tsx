import { InstitutionDto } from "@guallet/api-client/src/institutions";
import { useQueries, useQuery } from "@tanstack/react-query";
import { useGualletClient } from "./../GualletClientProvider";

const INSTITUTIONS_QUERY_KEY = "institutions";

export function useInstitutions() {
  const gualletClient = useGualletClient();

  const query = useQuery({
    queryKey: [INSTITUTIONS_QUERY_KEY],
    queryFn: async () => {
      return await gualletClient.institutions.getAll();
    },
    staleTime: Infinity,
    gcTime: Infinity,
  });

  const institutions =
    query.data?.filter((dto): dto is InstitutionDto => dto !== undefined) ?? [];

  return {
    institutions: institutions,
    userInstitutions: institutions.filter((i) => i.user_id !== null),
    systemInstitutions: institutions.filter((i) => i.user_id === null),
    ...query,
  };
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

export function useInstitutionsWithId(ids: string[]) {
  const gualletClient = useGualletClient();

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
