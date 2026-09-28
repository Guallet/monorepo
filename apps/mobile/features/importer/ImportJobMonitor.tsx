import { useEffect } from 'react';
import { useGualletClient, useQueryClient } from '@guallet/api-react';

const pendingJobs = new Set<string>();
const jobsWithStatusErrors = new Set<string>();

export function watchImportJob(jobId: string) {
  pendingJobs.add(jobId);
}

/** Keep financial queries fresh even when the user leaves the result screen. */
export function ImportJobMonitor() {
  const client = useGualletClient();
  const queryClient = useQueryClient();

  useEffect(() => {
    let checking = false;
    const timer = setInterval(() => {
      if (checking || pendingJobs.size === 0) return;
      checking = true;
      void (async () => {
        try {
          for (const jobId of pendingJobs) {
            try {
              const result = await client.dataImporter.getStatus(jobId);
              if (result.status === 'completed' || result.status === 'failed') {
                pendingJobs.delete(jobId);
                jobsWithStatusErrors.delete(jobId);
                await queryClient.invalidateQueries();
              }
            } catch {
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
    return () => clearInterval(timer);
  }, [client, queryClient]);

  return null;
}
