import { CategoryDto } from "@guallet/api-client";
import { useQuery } from "@tanstack/react-query";
import { useGualletClient } from "./../GualletClientProvider";

export type AppCategory = {
  subCategories: AppCategory[];
} & CategoryDto;

const CATEGORIES_QUERY_KEY = "categories";

export function useCategories() {
  const gualletClient = useGualletClient();

  const query = useQuery({
    queryKey: [CATEGORIES_QUERY_KEY],
    queryFn: async () => {
      return await gualletClient.categories.getAll();
    },
  });

  return {
    categories:
      query.data?.filter((dto): dto is CategoryDto => dto !== undefined) ?? [],
    ...query,
  };
}

export function useGroupedCategories() {
  const { categories, ...query } = useCategories();

  return {
    categories: mapAppCategories(categories ?? []),
    ...query,
  };
}

export function useGroupedCategory(id: string) {
  const { categories, ...rest } = useGroupedCategories();

  return {
    category:
      categories.find((x) => x.id === id) ??
      categories.flatMap((x) => x.subCategories).find((x) => x.id === id) ??
      null,
    ...rest,
  };
}

export function useCategory(id: string | null) {
  const gualletClient = useGualletClient();

  const query = useQuery({
    enabled: !!id,
    queryKey: [CATEGORIES_QUERY_KEY, id],
    queryFn: async () => {
      if (id) {
        return await gualletClient.categories.get(id);
      } else {
        throw Error("Category ID is null");
      }
    },
    gcTime: 1000 * 60 * 60, // 1 Hour
    staleTime: 1000 * 60 * 60, // 1 Hour
  });

  return { category: query.data ?? null, ...query };
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
