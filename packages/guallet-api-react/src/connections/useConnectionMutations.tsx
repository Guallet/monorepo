import { ObConnectionRequest } from "@guallet/api-client";
import { useGualletClient } from "./../GualletClientProvider";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const CONNECTIONS_QUERY_KEY = "connections";

export function useConnectionMutations() {
  const queryClient = useQueryClient();
  const gualletClient = useGualletClient();

  const createConnectionMutation = useMutation({
    mutationFn: async ({ request }: { request: ObConnectionRequest }) => {
      return await gualletClient.connections.createOpenBankingConnection(
        request
      );
    },
    onSuccess: async (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [CONNECTIONS_QUERY_KEY],
      });
    },
    onError: async (error, variables, context) => {
      console.error(error);
    },
  });

  const linkObAccountsMutation = useMutation({
    mutationFn: async ({ accountIds }: { accountIds: string[] }) => {
      return await gualletClient.connections.linkObAccounts(accountIds);
    },
    onSuccess: async (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [CONNECTIONS_QUERY_KEY],
      });
    },
    onError: async (error, variables, context) => {
      console.error(error);
    },
  });

  return {
    createConnectionMutation,
    linkObAccountsMutation,
  };
}
