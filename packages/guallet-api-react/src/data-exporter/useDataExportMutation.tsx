import type { DataExportRequest } from '@guallet/api-client';
import { useMutation } from '@tanstack/react-query';
import { useGualletClient } from '../GualletClientProvider';

export function useDataExportMutation() {
  const client = useGualletClient();

  return useMutation({
    mutationFn: (request: DataExportRequest) =>
      client.dataExporter.exportData(request),
  });
}
