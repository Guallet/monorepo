import { LunchFlowAccountDto } from '@guallet/api-client';
import { useQuery } from '@tanstack/react-query';
import { useGualletClient } from '../GualletClientProvider';

export const LUNCHFLOW_CREDENTIAL_QUERY_KEY = 'lunchflow-credential';
export const LUNCHFLOW_ACCOUNTS_QUERY_KEY = 'lunchflow-accounts';

export function useLunchFlowCredential() {
  const client = useGualletClient();
  const query = useQuery({
    queryKey: [LUNCHFLOW_CREDENTIAL_QUERY_KEY],
    queryFn: () => client.lunchFlow.getCredential(),
  });
  return { credential: query.data ?? null, ...query };
}

export function useLunchFlowAccounts(enabled = true) {
  const client = useGualletClient();
  const query = useQuery({
    queryKey: [LUNCHFLOW_ACCOUNTS_QUERY_KEY],
    queryFn: async () => (await client.lunchFlow.getAccounts()).accounts,
    enabled,
  });
  return {
    accounts:
      query.data?.filter(
        (account): account is LunchFlowAccountDto => account !== undefined,
      ) ?? [],
    ...query,
  };
}
