import { gualletClient } from "@/api/gualletClient";
import { CategoryDto } from "@guallet/api-client";
import { useQuery } from "@tanstack/react-query";

const CATEGORIES_QUERY_KEY = "categories";

export function useCategories() {
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: [CATEGORIES_QUERY_KEY],
    queryFn: async () => {
      return await gualletClient.categories.getAll();
    },
  });

  return {
    categories:
      data?.filter((dto): dto is CategoryDto => dto !== undefined) ?? [],
    isLoading,
    refetch,
    isFetching,
  };
}

export function useGroupedCategories() {
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: [CATEGORIES_QUERY_KEY],
    queryFn: async () => {
      return await gualletClient.categories.getAll();
    },
  });

  return {
    categories:
      data?.filter((dto): dto is CategoryDto => dto !== undefined) ?? [],
    isLoading,
    refetch,
    isFetching,
  };
}

export function useTransaction(id: string) {
  const { data, isLoading, isFetching, refetch, error } = useQuery({
    queryKey: [CATEGORIES_QUERY_KEY, id],
    queryFn: async () => {
      return await gualletClient.categories.get(id);
    },
    gcTime: 1000 * 60 * 60, // 1 Hour
    staleTime: 1000 * 60 * 60, // 1 Hour
  });

  return { category: data ?? null, isLoading, refetch, isFetching, error };
}
