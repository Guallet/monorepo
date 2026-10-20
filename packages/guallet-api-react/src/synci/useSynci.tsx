import { SynciAccountDto, SynciCredentialDto } from '@guallet/api-client';
import { useQuery } from '@tanstack/react-query';
import { useGualletClient } from '../GualletClientProvider';

export const SYNCI_CREDENTIAL_QUERY_KEY = 'synci-credential';
export const SYNCI_ACCOUNTS_QUERY_KEY = 'synci-accounts';

export function useSynciCredential() {
  const client = useGualletClient();
  const query = useQuery({
    queryKey: [SYNCI_CREDENTIAL_QUERY_KEY],
    queryFn: () => client.synci.getCredential(),
  });
  return {
    credential:
      query.data ??
      ({ configured: false, keyHint: null } as SynciCredentialDto),
    ...query,
  };
}

export function useSynciAccounts(enabled = true) {
  const client = useGualletClient();
  const query = useQuery({
    queryKey: [SYNCI_ACCOUNTS_QUERY_KEY],
    queryFn: async () => (await client.synci.getAccounts()).accounts,
    enabled,
  });
  return {
    accounts:
      query.data?.filter(
        (account): account is SynciAccountDto => account !== undefined,
      ) ?? [],
    ...query,
  };
}
