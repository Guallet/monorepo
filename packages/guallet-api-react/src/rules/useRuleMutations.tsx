import {
  CreateRuleRequest,
  UpdateRuleRequest,
} from "@guallet/api-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useGualletClient } from "./../GualletClientProvider";
import { RULES_QUERY_KEY } from "./useRules";

export function useRuleMutations() {
  const queryClient = useQueryClient();
  const gualletClient = useGualletClient();

  const createRuleMutation = useMutation({
    mutationFn: async ({ request }: { request: CreateRuleRequest }) => {
      return await gualletClient.rules.create(request);
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({
        queryKey: [RULES_QUERY_KEY],
      });
    },
    onError: async (error) => {
      console.error(error);
    },
  });

  const updateRuleMutation = useMutation({
    mutationFn: async ({
      id,
      request,
    }: {
      id: string;
      request: UpdateRuleRequest;
    }) => {
      return await gualletClient.rules.update({
        id: id,
        dto: request,
      });
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({
        queryKey: [RULES_QUERY_KEY],
      });
      queryClient.invalidateQueries({
        queryKey: [RULES_QUERY_KEY, data.id],
      });
    },
    onError: async (error) => {
      console.error(error);
    },
  });

  const deleteRuleMutation = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      return await gualletClient.rules.delete(id);
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({
        queryKey: [RULES_QUERY_KEY],
      });
        queryClient.removeQueries({
          queryKey: [RULES_QUERY_KEY, variables.id],
        });
    },
    onError: async (error) => {
      console.error(error);
    },
  });

  const reorderRulesMutation = useMutation({
    mutationFn: async ({ ruleIds }: { ruleIds: string[] }) => {
      return await gualletClient.rules.reorder(ruleIds);
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({
        queryKey: [RULES_QUERY_KEY],
      });
    },
    onError: async (error) => {
      console.error(error);
    },
  });

  const reorderConditionsMutation = useMutation({
    mutationFn: async ({
      ruleId,
      conditionIds,
    }: {
      ruleId: string;
      conditionIds: string[];
    }) => {
      return await gualletClient.rules.reorderConditions({
        ruleId,
        conditionIds,
      });
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({
        queryKey: [RULES_QUERY_KEY, data.id],
      });
    },
    onError: async (error) => {
      console.error(error);
    },
  });

  return {
    createRuleMutation,
    updateRuleMutation,
    deleteRuleMutation,
    reorderRulesMutation,
    reorderConditionsMutation,
  };
}
