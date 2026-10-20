import {
  ImportBankSyncAccountsRequest,
  SaveBankSyncCredentialRequest,
} from '@guallet/api-client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useGualletClient } from '../GualletClientProvider';
import {
  BANKSYNC_ACCOUNTS_QUERY_KEY,
  BANKSYNC_CREDENTIAL_QUERY_KEY,
} from './useBankSync';

export function useBankSyncMutations() {
  const client = useGualletClient();
  const queryClient = useQueryClient();
  const invalidateBankSync = async () => {
    await queryClient.invalidateQueries({
      queryKey: [BANKSYNC_CREDENTIAL_QUERY_KEY],
    });
    await queryClient.invalidateQueries({
      queryKey: [BANKSYNC_ACCOUNTS_QUERY_KEY],
    });
  };

  const saveCredentialMutation = useMutation({
    mutationFn: (request: SaveBankSyncCredentialRequest) =>
      client.bankSync.saveCredential(request),
    onSuccess: invalidateBankSync,
  });
  const deleteCredentialMutation = useMutation({
    mutationFn: () => client.bankSync.deleteCredential(),
    onSuccess: invalidateBankSync,
  });
  const importAccountsMutation = useMutation({
    mutationFn: (request: ImportBankSyncAccountsRequest) =>
      client.bankSync.importAccounts(request),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['accounts'] });
      await queryClient.invalidateQueries({ queryKey: ['transactions'] });
      await queryClient.invalidateQueries({
        queryKey: ['accounts-transactions'],
      });
      await queryClient.invalidateQueries({
        queryKey: [BANKSYNC_ACCOUNTS_QUERY_KEY],
      });
    },
  });
  const syncMutation = useMutation({
    mutationFn: () => client.bankSync.sync(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['accounts'] });
      await queryClient.invalidateQueries({ queryKey: ['transactions'] });
      await queryClient.invalidateQueries({
        queryKey: ['accounts-transactions'],
      });
    },
  });
  const unlinkAccountMutation = useMutation({
    mutationFn: (account: { bankId: string; accountId: string }) =>
      client.bankSync.unlinkAccount(account),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [BANKSYNC_ACCOUNTS_QUERY_KEY],
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
