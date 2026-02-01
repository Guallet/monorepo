import { CreateRuleRequest, UpdateRuleRequest } from '@guallet/api-client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useGualletClient } from './../GualletClientProvider';

const RULES_QUERY_KEY = 'rules';

export function useRuleMutations() {
  const queryClient = useQueryClient();
  const gualletClient = useGualletClient();

  const createRuleMutation = useMutation({
    mutationFn: async ({ request }: { request: CreateRuleRequest }) => {
      return await gualletClient.rules.create(request);
    },
    onSuccess: async (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [RULES_QUERY_KEY],
      });
    },
    onError: async (error, variables, context) => {
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
      return await gualletClient.rules.update(id, request);
    },
    onSuccess: async (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [RULES_QUERY_KEY],
      });
      queryClient.invalidateQueries({
        queryKey: [RULES_QUERY_KEY, variables.id],
      });
    },
    onError: async (error, variables, context) => {
      console.error(error);
    },
  });

  const deleteRuleMutation = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      return await gualletClient.rules.delete(id);
    },
    onSuccess: async (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [RULES_QUERY_KEY],
      });
      queryClient.removeQueries({
        queryKey: [RULES_QUERY_KEY, variables.id],
      });
    },
    onError: async (error, variables, context) => {
      console.error(error);
    },
  });

  return {
    createRuleMutation,
    updateRuleMutation,
    deleteRuleMutation,
  };
}
