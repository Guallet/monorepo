import { useEffect } from 'react';
import { useAuth } from '@guallet/auth';
import {
  isPermanentImportStatusError,
  useGualletClient,
  useQueryClient,
} from '@guallet/api-react';
import {
  pendingImportJobs,
  restorePendingImportJobs,
  unwatchImportJob,
} from '../pendingImportJobs';

const jobsWithStatusErrors = new Set<string>();

async function refreshPendingJobs(
  client: ReturnType<typeof useGualletClient>,
  queryClient: ReturnType<typeof useQueryClient>,
  userId: string,
  isActive: () => boolean,
) {
  const jobIds = [...pendingImportJobs];
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
        unwatchImportJob(jobId, userId);
        shouldInvalidate = true;
      }
      return;
    }
    if (isPermanentImportStatusError(outcome.reason)) {
      unwatchImportJob(jobId, userId);
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

export function ImportJobMonitor() {
  const { userId } = useAuth();
  const client = useGualletClient();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;
    restorePendingImportJobs(userId);
    let active = true;
    let checking = false;
    const timer = setInterval(() => {
      if (checking || pendingImportJobs.size === 0) return;
      checking = true;
      void refreshPendingJobs(
        client,
        queryClient,
        userId,
        () => active,
      ).finally(() => {
        checking = false;
      });
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
