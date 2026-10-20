import {
  ImportLunchFlowAccountsRequest,
  SaveLunchFlowCredentialRequest,
} from '@guallet/api-client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useGualletClient } from '../GualletClientProvider';
import {
  LUNCHFLOW_ACCOUNTS_QUERY_KEY,
  LUNCHFLOW_CREDENTIAL_QUERY_KEY,
} from './useLunchFlow';

export function useLunchFlowMutations() {
  const client = useGualletClient();
  const queryClient = useQueryClient();

  const saveCredentialMutation = useMutation({
    mutationFn: (request: SaveLunchFlowCredentialRequest) =>
      client.lunchFlow.saveCredential(request),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [LUNCHFLOW_CREDENTIAL_QUERY_KEY],
      });
      await queryClient.invalidateQueries({
        queryKey: [LUNCHFLOW_ACCOUNTS_QUERY_KEY],
      });
    },
  });

  const deleteCredentialMutation = useMutation({
    mutationFn: () => client.lunchFlow.deleteCredential(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [LUNCHFLOW_CREDENTIAL_QUERY_KEY],
      });
      await queryClient.invalidateQueries({
        queryKey: [LUNCHFLOW_ACCOUNTS_QUERY_KEY],
      });
    },
  });

  const importAccountsMutation = useMutation({
    mutationFn: (request: ImportLunchFlowAccountsRequest) =>
      client.lunchFlow.importAccounts(request),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['accounts'] });
      await queryClient.invalidateQueries({ queryKey: ['transactions'] });
      await queryClient.invalidateQueries({
        queryKey: ['accounts-transactions'],
      });
      await queryClient.invalidateQueries({
        queryKey: [LUNCHFLOW_ACCOUNTS_QUERY_KEY],
      });
    },
  });

  const syncMutation = useMutation({
    mutationFn: () => client.lunchFlow.sync(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['accounts'] });
      await queryClient.invalidateQueries({ queryKey: ['transactions'] });
      await queryClient.invalidateQueries({
        queryKey: ['accounts-transactions'],
      });
    },
  });

  const unlinkAccountMutation = useMutation({
    mutationFn: (accountId: string) =>
      client.lunchFlow.unlinkAccount(accountId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [LUNCHFLOW_ACCOUNTS_QUERY_KEY],
      });
    },
  });

  return {
    saveCredentialMutation,
    deleteCredentialMutation,
    importAccountsMutation,
    syncMutation,
    unlinkAccountMutation,
  };
}
