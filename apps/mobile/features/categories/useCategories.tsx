import { gualletClient } from "@/api/gualletClient";
import { CategoryDto } from "@guallet/api-client";
import { useQuery } from "@tanstack/react-query";

export type AppCategory = {
  subCategories: AppCategory[];
} & CategoryDto;

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
  const { categories, isLoading, isFetching, refetch } = useCategories();

  return {
    categories: mapAppCategories(categories ?? []),
    isLoading,
    refetch,
    isFetching,
  };
}

export function useGroupedCategory(id: string) {
  const { categories, isLoading, isFetching, refetch } = useGroupedCategories();

  return {
    category:
      categories.find((x) => x.id === id) ??
      categories.flatMap((x) => x.subCategories).find((x) => x.id === id) ??
      null,
    isLoading,
    refetch,
    isFetching,
  };
}

export function useCategory(id: string) {
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

function mapAppCategories(categories: CategoryDto[]): AppCategory[] {
  const roots = categories
    .filter((x) => x.parentId === null || x.parentId === undefined)
    .map((x: CategoryDto) => {
      const appCategory: AppCategory = {
        id: x.id,
        name: x.name,
        icon: x.icon,
        colour: x.colour,
        parentId: null,
        subCategories: [],
      };
      return appCategory;
    });

  for (const parent of roots) {
    const children = categories
      .filter((x) => x.parentId === parent.id)
      .map((x: CategoryDto) => {
        const appCategory: AppCategory = {
          id: x.id,
          name: x.name,
          icon: x.icon,
          colour: x.colour,
          parentId: x.parentId,
          subCategories: [],
        };

        return appCategory;
      });
    parent.subCategories = children;
  }
  return roots ?? [];
}
