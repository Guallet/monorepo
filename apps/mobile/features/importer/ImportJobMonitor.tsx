import { useEffect, useRef } from 'react';
import { useGualletClient, useQueryClient } from '@guallet/api-react';
import { useAuth } from '@guallet/auth';
import { isPermanentImportStatusError } from './importStatusError';

const pendingJobs = new Set<string>();
const jobsWithStatusErrors = new Set<string>();

export function watchImportJob(jobId: string) {
  pendingJobs.add(jobId);
}

/** Keep financial queries fresh even when the user leaves the result screen. */
export function ImportJobMonitor() {
  const client = useGualletClient();
  const queryClient = useQueryClient();
  const { isLoading, userId } = useAuth();
  const previousUserId = useRef(userId);

  useEffect(() => {
    if (isLoading) return;
    if (previousUserId.current !== userId || !userId) {
      pendingJobs.clear();
      jobsWithStatusErrors.clear();
    }
    previousUserId.current = userId;
  }, [isLoading, userId]);

  useEffect(() => {
    if (isLoading || !userId) return;
    let checking = false;
    let active = true;
    const timer = setInterval(() => {
      if (checking || pendingJobs.size === 0) return;
      checking = true;
      void (async () => {
        try {
          for (const jobId of pendingJobs) {
            try {
              const result = await client.dataImporter.getStatus(jobId);
              if (!active) break;
              if (result.status === 'completed' || result.status === 'failed') {
                pendingJobs.delete(jobId);
                jobsWithStatusErrors.delete(jobId);
                await queryClient.invalidateQueries();
              }
            } catch (error) {
              if (!active) break;
              if (isPermanentImportStatusError(error)) {
                pendingJobs.delete(jobId);
                jobsWithStatusErrors.delete(jobId);
                await queryClient.invalidateQueries();
                continue;
              }
              // Keep checking after a transient network error. Invalidate once
              // in case the job finished while its status was unavailable.
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
    };
  }, [client, isLoading, queryClient, userId]);

  return null;
}
