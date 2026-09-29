import { ApiError } from '@guallet/api-client';
import { useQuery } from '@tanstack/react-query';
import { useGualletClient } from '../GualletClientProvider';

export function isPermanentImportStatusError(error: unknown): boolean {
  return (
    error instanceof ApiError &&
    (error.status === 401 || error.status === 403 || error.status === 404)
  );
}

export function useImportStatus(jobId: string) {
  const client = useGualletClient();
  return useQuery({
    queryKey: ['data-importer', 'status', jobId],
    enabled: Boolean(jobId),
    queryFn: () => client.dataImporter.getStatus(jobId),
    retry: (failures, error) =>
      !isPermanentImportStatusError(error) && failures < 2,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === 'completed' || status === 'failed') return false;
      if (isPermanentImportStatusError(query.state.error)) return false;
      return 3000;
    },
  });
}
