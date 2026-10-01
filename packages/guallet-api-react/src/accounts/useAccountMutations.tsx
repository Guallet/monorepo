import {
  CreateAccountRequest,
  UpdateAccountRequest,
} from '@guallet/api-client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useGualletClient } from './../GualletClientProvider';

const ACCOUNTS_QUERY_KEY = 'accounts';

export function useAccountMutations() {
  const queryClient = useQueryClient();
  const gualletClient = useGualletClient();

  const invalidateAccountAndGoalData = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: [ACCOUNTS_QUERY_KEY] }),
      queryClient.invalidateQueries({ queryKey: ['savingGoals'] }),
    ]);
  };

  const createAccountMutation = useMutation({
    mutationFn: async ({ request }: { request: CreateAccountRequest }) => {
      return await gualletClient.accounts.create(request);
    },
    onSuccess: invalidateAccountAndGoalData,
    onError: async (error, variables, context) => {
      console.error(error);
    },
  });

  const updateAccountMutation = useMutation({
    mutationFn: async ({
      id,
      request,
    }: {
      id: string;
      request: UpdateAccountRequest;
    }) => {
      return await gualletClient.accounts.update(id, request);
    },
    onSuccess: invalidateAccountAndGoalData,
    onError: async (error, variables, context) => {
      console.error(error);
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      return await gualletClient.accounts.delete(id);
    },
    onSuccess: invalidateAccountAndGoalData,
    onError: async (error, variables, context) => {
      console.error(error);
    },
  });

  return {
    createAccountMutation,
    updateAccountMutation,
    deleteAccountMutation,
  };
}
