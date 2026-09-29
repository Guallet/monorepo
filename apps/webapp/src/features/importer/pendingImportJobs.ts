export const pendingImportJobs = new Set<string>();

export function watchImportJob(jobId: string) {
  pendingImportJobs.add(jobId);
}
