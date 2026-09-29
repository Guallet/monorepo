import { useEffect } from 'react';
import { useAuth } from '@guallet/auth';
import {
  isPermanentImportStatusError,
  useGualletClient,
  useQueryClient,
} from '@guallet/api-react';
import { pendingImportJobs } from '../pendingImportJobs';

const jobsWithStatusErrors = new Set<string>();

export function ImportJobMonitor() {
  const { userId } = useAuth();
  const client = useGualletClient();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;
    let active = true;
    let checking = false;
    const timer = setInterval(() => {
      if (checking || pendingImportJobs.size === 0) return;
      checking = true;
      void (async () => {
        try {
          for (const jobId of pendingImportJobs) {
            try {
              const result = await client.dataImporter.getStatus(jobId);
              if (!active) break;
              jobsWithStatusErrors.delete(jobId);
              if (result.status === 'completed' || result.status === 'failed') {
                pendingImportJobs.delete(jobId);
                await queryClient.invalidateQueries();
              }
            } catch (error) {
              if (!active) break;
              if (isPermanentImportStatusError(error)) {
                pendingImportJobs.delete(jobId);
                jobsWithStatusErrors.delete(jobId);
                await queryClient.invalidateQueries();
                continue;
              }
              if (!jobsWithStatusErrors.has(jobId)) {
                jobsWithStatusErrors.add(jobId);
                await queryClient.invalidateQueries();
              }
            }
          }
        } finally {
          checking = false;
        }
      })();
    }, 3000);
    return () => {
      active = false;
      clearInterval(timer);
      pendingImportJobs.clear();
      jobsWithStatusErrors.clear();
    };
  }, [client, queryClient, userId]);

  return null;
}
