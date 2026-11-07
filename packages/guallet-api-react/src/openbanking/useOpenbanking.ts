import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useGualletClient } from '../GualletClientProvider';
export const OPENBANKING_QUERY_KEY = 'openbanking';
export function useBankProviders() {
  const client = useGualletClient();
  return useQuery({
    queryKey: [OPENBANKING_QUERY_KEY, 'providers'],
    queryFn: () => client.openbanking.getProviders(),
    staleTime: Infinity,
  });
}
export function useBankConnections() {
  const client = useGualletClient();
  return useQuery({
    queryKey: [OPENBANKING_QUERY_KEY, 'connections'],
    queryFn: () => client.openbanking.getConnections(),
  });
}
export function useBankAccounts(id?: string) {
  const client = useGualletClient();
  return useQuery({
    queryKey: [OPENBANKING_QUERY_KEY, 'accounts', id],
    queryFn: () => client.openbanking.getAccounts(id!),
    enabled: Boolean(id),
  });
}
export function useBankInstitutions(id: string, country: string) {
  const client = useGualletClient();
  return useQuery({
    queryKey: [OPENBANKING_QUERY_KEY, 'institutions', id, country],
    queryFn: () => client.openbanking.getInstitutions(id, country),
    enabled: /^[A-Z]{2}$/.test(country),
    staleTime: 3600_000,
  });
}
export function useBankJob(id?: string, jobId?: string) {
  const client = useGualletClient();
  const cache = useQueryClient();
  const query = useQuery({
    queryKey: [OPENBANKING_QUERY_KEY, 'jobs', id, jobId],
    queryFn: ({ signal }) => client.openbanking.getJob(id!, jobId!, signal),
    enabled: Boolean(id && jobId),
    refetchInterval: (query) =>
      query.state.data?.status === 'completed' ||
      query.state.data?.status === 'failed' ||
      query.state.status === 'error'
        ? false
        : 3000,
    retry: 2,
  });
  const status = query.data?.status;
  useEffect(() => {
    if (status !== 'completed' && status !== 'failed') return;
    // A failed import can have persisted some accounts before an upstream failure.
    for (const queryKey of [
      [OPENBANKING_QUERY_KEY, 'accounts', id],
      [OPENBANKING_QUERY_KEY, 'connections'],
      ['accounts'],
      ['transactions'],
      ['accounts-transactions'],
      ['accounts-charts'],
      ['reports'],
    ]) {
      void cache.invalidateQueries({ queryKey });
    }
  }, [status, id, jobId, cache]);
  return query;
}
