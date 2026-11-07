import { useQuery } from '@tanstack/react-query';
import { useGualletClient } from '../GualletClientProvider';

export function useAccountConnection(accountId?: string) {
  const client = useGualletClient();
  const query = useQuery({
    queryKey: ['accounts', accountId, 'connection'],
    enabled: Boolean(accountId),
    queryFn: () => client.accounts.getAccountConnection(accountId!),
  });

  return {
    ...query,
    connection: query.data?.connection ?? null,
  };
}
