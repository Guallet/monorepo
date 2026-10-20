import { BankSyncAccountDto, BankSyncCredentialDto } from '@guallet/api-client';
import { useQuery } from '@tanstack/react-query';
import { useGualletClient } from '../GualletClientProvider';

export const BANKSYNC_CREDENTIAL_QUERY_KEY = 'banksync-credential';
export const BANKSYNC_ACCOUNTS_QUERY_KEY = 'banksync-accounts';

export function useBankSyncCredential() {
  const client = useGualletClient();
  const { data, ...query } = useQuery({
    queryKey: [BANKSYNC_CREDENTIAL_QUERY_KEY],
    queryFn: () => client.bankSync.getCredential(),
    select: (credential): BankSyncCredentialDto => credential,
  });
  return {
    credential: data ?? null,
    ...query,
  };
}

export function useBankSyncAccounts(enabled = true) {
  const client = useGualletClient();
  const { data, ...query } = useQuery({
    queryKey: [BANKSYNC_ACCOUNTS_QUERY_KEY],
    queryFn: () => client.bankSync.getAccounts(),
    enabled,
    select: (response): BankSyncAccountDto[] => response.accounts,
  });
  return { accounts: data ?? [], ...query };
}
