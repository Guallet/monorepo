import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CreateDecisionConnectionRequest,
  UpdateDecisionConnectionRequest,
  ClassificationRunRequest,
} from '@guallet/api-client';
import { useGualletClient } from '../GualletClientProvider';
export function useDecisionConnection() {
  const client = useGualletClient();
  const query = useQuery({
    queryKey: ['decision-connections'],
    queryFn: () => client.classification.getConnections(),
  });
  return { ...query, connection: query.data?.[0] ?? null };
}
export function useClassificationStats() {
  const client = useGualletClient();
  return useQuery({
    queryKey: ['classification-stats'],
    queryFn: () => client.classification.stats(),
  });
}
export function useClassificationRun(id?: string) {
  const client = useGualletClient();
  const cache = useQueryClient();
  const query = useQuery({
    queryKey: ['classification-run', id],
    queryFn: () => client.classification.getRun(id!),
    enabled: Boolean(id),
    refetchInterval: (q) => (q.state.data?.complete ? false : 2000),
  });
  useEffect(() => {
    if (query.dataUpdatedAt) {
      void cache.invalidateQueries({ queryKey: ['transactions'] });
      void cache.invalidateQueries({ queryKey: ['classification-stats'] });
    }
  }, [cache, query.dataUpdatedAt]);
  return query;
}
export function useClassificationMutations() {
  const client = useGualletClient();
  const cache = useQueryClient();
  const refresh = async () => {
    await Promise.all([
      cache.invalidateQueries({ queryKey: ['decision-connections'] }),
      cache.invalidateQueries({ queryKey: ['classification-stats'] }),
      cache.invalidateQueries({ queryKey: ['transactions'] }),
    ]);
  };
  const create = useMutation({
    mutationFn: (dto: CreateDecisionConnectionRequest) =>
      client.classification.createConnection(dto),
    onSuccess: refresh,
  });
  const update = useMutation({
    mutationFn: (dto: UpdateDecisionConnectionRequest) =>
      client.classification.updateConnection(dto),
    onSuccess: refresh,
  });
  const remove = useMutation({
    mutationFn: () => client.classification.deleteConnection(),
    onSuccess: refresh,
  });
  const test = useMutation({
    mutationFn: (dto?: CreateDecisionConnectionRequest) =>
      client.classification.testConnection(dto),
    onSuccess: refresh,
  });
  const run = useMutation({
    mutationFn: (dto: ClassificationRunRequest) =>
      client.classification.run(dto),
  });
  const dismiss = useMutation({
    mutationFn: (id: string) => client.classification.dismiss(id),
    onSuccess: refresh,
  });
  return { create, update, remove, test, run, dismiss };
}
