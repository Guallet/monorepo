import { useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useGualletClient, useQueryClient } from '@guallet/api-react';
import { useAuth } from '@guallet/auth';
import { isPermanentImportStatusError } from './importStatusError';

const pendingJobs = new Set<string>();
const jobsWithStatusErrors = new Set<string>();
let storageWrite = Promise.resolve();

function storageKey(userId: string) {
  return `guallet:pending-import-jobs:${userId}`;
}

function savePendingJobs(userId: string) {
  const snapshot = JSON.stringify([...pendingJobs]);
  storageWrite = storageWrite
    .then(() => AsyncStorage.setItem(storageKey(userId), snapshot))
    .catch(() => {});
  return storageWrite;
}

async function restorePendingJobs(userId: string, isActive: () => boolean) {
  try {
    await storageWrite;
    const saved = JSON.parse(
      (await AsyncStorage.getItem(storageKey(userId))) ?? '[]',
    );
    if (!isActive() || !Array.isArray(saved)) return;
    for (const jobId of saved) {
      if (typeof jobId === 'string') pendingJobs.add(jobId);
    }
  } catch {
    // Monitoring continues in memory when storage is unavailable.
  }
}

export function watchImportJob(jobId: string, userId?: string | null) {
  pendingJobs.add(jobId);
  if (userId) void savePendingJobs(userId);
}

async function refreshPendingJobs(
  client: ReturnType<typeof useGualletClient>,
  queryClient: ReturnType<typeof useQueryClient>,
  userId: string,
  isActive: () => boolean,
) {
  const jobIds = [...pendingJobs];
  const outcomes = await Promise.allSettled(
    jobIds.map((jobId) => client.dataImporter.getStatus(jobId)),
  );
  if (!isActive()) return;
  let shouldInvalidate = false;
  let shouldPersist = false;
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
        shouldPersist = true;
      }
      return;
    }
    if (isPermanentImportStatusError(outcome.reason)) {
      pendingJobs.delete(jobId);
      jobsWithStatusErrors.delete(jobId);
      shouldInvalidate = true;
      shouldPersist = true;
      return;
    }
    if (!jobsWithStatusErrors.has(jobId)) {
      jobsWithStatusErrors.add(jobId);
      shouldInvalidate = true;
    }
  });
  if (shouldPersist) await savePendingJobs(userId);
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
    void restorePendingJobs(userId, () => active);
    const timer = setInterval(() => {
      if (checking || pendingJobs.size === 0) return;
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
    };
  }, [client, isLoading, queryClient, userId]);

  return null;
}
