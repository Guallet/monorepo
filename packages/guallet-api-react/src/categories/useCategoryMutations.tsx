import {
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "@guallet/api-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useGualletClient } from "./../GualletClientProvider";

const CATEGORIES_QUERY_KEY = "categories";

export function useCategoryMutations() {
  const queryClient = useQueryClient();
  const gualletClient = useGualletClient();

  const createCategoryMutation = useMutation({
    mutationFn: async ({ request }: { request: CreateCategoryRequest }) => {
      return await gualletClient.categories.create(request);
    },
    onSuccess: async (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [CATEGORIES_QUERY_KEY],
      });
    },
    onError: async (error, variables, context) => {
      console.error(error);
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async ({
      id,
      request,
    }: {
      id: string;
      request: UpdateCategoryRequest;
    }) => {
      return await gualletClient.categories.update({
        id: id,
        dto: request,
      });
    },
    onSuccess: async (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [CATEGORIES_QUERY_KEY, data.id],
      });
    },
    onError: async (error, variables, context) => {
      console.error(error);
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      return await gualletClient.categories.delete(id);
    },
    onSuccess: async (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [CATEGORIES_QUERY_KEY],
      });
    },
    onError: async (error, variables, context) => {
      console.error(error);
    },
  });

  return {
    createCategoryMutation,
    updateCategoryMutation,
    deleteCategoryMutation,
  };
}
