import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useGualletClient } from './../GualletClientProvider';
import {
  CreateSubscriptionRequest,
  UpdateSubscriptionRequest,
} from '@guallet/api-client';

const SUBSCRIPTIONS_QUERY_KEY = 'subscriptions';

export function useSubscriptionsMutations() {
  const queryClient = useQueryClient();
  const gualletClient = useGualletClient();

  const createSubscriptionMutation = useMutation({
    mutationFn: async ({ request }: { request: CreateSubscriptionRequest }) => {
      return await gualletClient.subscriptions.create(request);
    },
    onSuccess: async (data, variables) => {
      queryClient.setQueryData([SUBSCRIPTIONS_QUERY_KEY, data.id], data);
      queryClient.invalidateQueries({
        queryKey: [SUBSCRIPTIONS_QUERY_KEY],
      });
    },
    onError: async (error, variables, context) => {
      console.error(error);
    },
  });

  const updateSubscriptionMutation = useMutation({
    mutationFn: async ({
      id,
      request,
    }: {
      id: string;
      request: UpdateSubscriptionRequest;
    }) => {
      return await gualletClient.subscriptions.update({
        subscriptionId: id,
        dto: request,
      });
    },
    onSuccess: async (data, variables) => {
      queryClient.setQueryData([SUBSCRIPTIONS_QUERY_KEY, data.id], data);
      queryClient.invalidateQueries({
        queryKey: [SUBSCRIPTIONS_QUERY_KEY],
      });
    },
    onError: async (error, variables, context) => {
      console.error(error);
    },
  });

  const deleteSubscriptionMutation = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      return await gualletClient.subscriptions.delete(id);
    },
    onSuccess: async (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [SUBSCRIPTIONS_QUERY_KEY],
      });
    },
    onError: async (error, variables, context) => {
      console.error(error);
    },
  });

  return {
    createSubscriptionMutation,
    updateSubscriptionMutation,
    deleteSubscriptionMutation,
  };
}
