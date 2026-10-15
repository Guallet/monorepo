export const pendingImportJobs = new Set<string>();

function storageKey(userId: string) {
  return `guallet:pending-import-jobs:${userId}`;
}

function savePendingJobs(userId: string) {
  try {
    localStorage.setItem(
      storageKey(userId),
      JSON.stringify([...pendingImportJobs]),
    );
  } catch {
    // Monitoring continues in memory when storage is unavailable.
  }
}

export function restorePendingImportJobs(userId: string) {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey(userId)) ?? '[]');
    if (Array.isArray(saved)) {
      for (const jobId of saved) {
        if (typeof jobId === 'string') pendingImportJobs.add(jobId);
      }
    }
  } catch {
    // Ignore malformed or unavailable browser storage.
  }
}

export function watchImportJob(jobId: string, userId?: string | null) {
  pendingImportJobs.add(jobId);
  if (userId) savePendingJobs(userId);
}

export function unwatchImportJob(jobId: string, userId: string) {
  pendingImportJobs.delete(jobId);
  savePendingJobs(userId);
}
