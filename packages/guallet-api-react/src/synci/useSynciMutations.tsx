import {
  ImportSynciAccountsRequest,
  SaveSynciCredentialRequest,
} from '@guallet/api-client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useGualletClient } from '../GualletClientProvider';
import {
  SYNCI_ACCOUNTS_QUERY_KEY,
  SYNCI_CREDENTIAL_QUERY_KEY,
} from './useSynci';

export function useSynciMutations() {
  const client = useGualletClient();
  const queryClient = useQueryClient();

  const saveCredentialMutation = useMutation({
    mutationFn: (request: SaveSynciCredentialRequest) =>
      client.synci.saveCredential(request),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [SYNCI_CREDENTIAL_QUERY_KEY],
      });
      await queryClient.invalidateQueries({
        queryKey: [SYNCI_ACCOUNTS_QUERY_KEY],
      });
    },
  });

  const deleteCredentialMutation = useMutation({
    mutationFn: () => client.synci.deleteCredential(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [SYNCI_CREDENTIAL_QUERY_KEY],
      });
      await queryClient.invalidateQueries({
        queryKey: [SYNCI_ACCOUNTS_QUERY_KEY],
      });
    },
  });

  const importAccountsMutation = useMutation({
    mutationFn: (request: ImportSynciAccountsRequest) =>
      client.synci.importAccounts(request),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['accounts'] });
      await queryClient.invalidateQueries({ queryKey: ['transactions'] });
      await queryClient.invalidateQueries({
        queryKey: ['accounts-transactions'],
      });
      await queryClient.invalidateQueries({
        queryKey: [SYNCI_ACCOUNTS_QUERY_KEY],
      });
    },
  });

  const syncMutation = useMutation({
    mutationFn: () => client.synci.sync(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['accounts'] });
      await queryClient.invalidateQueries({ queryKey: ['transactions'] });
      await queryClient.invalidateQueries({
        queryKey: ['accounts-transactions'],
      });
    },
  });

  const unlinkAccountMutation = useMutation({
    mutationFn: (accountId: string) => client.synci.unlinkAccount(accountId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [SYNCI_ACCOUNTS_QUERY_KEY],
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
