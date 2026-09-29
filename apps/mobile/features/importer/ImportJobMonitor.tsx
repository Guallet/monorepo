import { useEffect, useRef } from 'react';
import { useGualletClient, useQueryClient } from '@guallet/api-react';
import { useAuth } from '@guallet/auth';
import { isPermanentImportStatusError } from './importStatusError';

const pendingJobs = new Set<string>();
const jobsWithStatusErrors = new Set<string>();

export function watchImportJob(jobId: string) {
  pendingJobs.add(jobId);
}

async function refreshPendingJobs(
  client: ReturnType<typeof useGualletClient>,
  queryClient: ReturnType<typeof useQueryClient>,
  isActive: () => boolean,
) {
  const jobIds = [...pendingJobs];
  const outcomes = await Promise.allSettled(
    jobIds.map((jobId) => client.dataImporter.getStatus(jobId)),
  );
  if (!isActive()) return;
  let shouldInvalidate = false;
  outcomes.forEach((outcome, index) => {
    const jobId = jobIds[index];
    if (outcome.status === 'fulfilled') {
      jobsWithStatusErrors.delete(jobId);
      if (
        outcome.value.status === 'completed' ||
        outcome.value.status === 'failed'
      ) {
        pendingJobs.delete(jobId);
        shouldInvalidate = true;
      }
      return;
    }
    if (isPermanentImportStatusError(outcome.reason)) {
      pendingJobs.delete(jobId);
      jobsWithStatusErrors.delete(jobId);
      shouldInvalidate = true;
      return;
    }
    if (!jobsWithStatusErrors.has(jobId)) {
      jobsWithStatusErrors.add(jobId);
      shouldInvalidate = true;
    }
  });
  if (shouldInvalidate) await queryClient.invalidateQueries();
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
      void refreshPendingJobs(client, queryClient, () => active).finally(() => {
        checking = false;
      });
    }, 3000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [client, isLoading, queryClient, userId]);

  return null;
}
