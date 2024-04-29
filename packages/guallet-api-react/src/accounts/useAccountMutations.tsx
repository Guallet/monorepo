import { CreateAccountRequest } from "@guallet/api-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useGualletClient } from "./../GualletClientProvider";

const ACCOUNTS_QUERY_KEY = "accounts";

export function useAccountMutations() {
  const queryClient = useQueryClient();
  const gualletClient = useGualletClient();

  const createAccountMutation = useMutation({
    mutationFn: async ({ request }: { request: CreateAccountRequest }) => {
      return await gualletClient.accounts.create(request);
    },
    onSuccess: async (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [ACCOUNTS_QUERY_KEY],
      });
    },
    onError: async (error, variables, context) => {
      console.error(error);
    },
  });

  return {
    createAccountMutation,
  };
}
