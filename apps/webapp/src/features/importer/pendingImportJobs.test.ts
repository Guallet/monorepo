import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  pendingImportJobs,
  restorePendingImportJobs,
  unwatchImportJob,
  watchImportJob,
} from './pendingImportJobs';

const key = 'guallet:pending-import-jobs:user-1';

beforeEach(() => {
  pendingImportJobs.clear();
  vi.unstubAllGlobals();
});

describe('pending import jobs', () => {
  it('keeps a newly submitted job when browser storage cannot be read', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => {
        throw new Error('Storage unavailable');
      },
      setItem: () => {
        throw new Error('Storage unavailable');
      },
    });

    watchImportJob('job-1', 'user-1');
    restorePendingImportJobs('user-1');

    expect([...pendingImportJobs]).toEqual(['job-1']);
  });

  it('combines saved jobs with a new in-memory job and persists removals', () => {
    const stored = new Map([[key, '["job-1"]']]);
    vi.stubGlobal('localStorage', {
      getItem: (name: string) => stored.get(name) ?? null,
      setItem: (name: string, value: string) => stored.set(name, value),
    });

    watchImportJob('job-2');
    restorePendingImportJobs('user-1');
    expect([...pendingImportJobs]).toEqual(['job-2', 'job-1']);

    unwatchImportJob('job-1', 'user-1');
    expect(JSON.parse(stored.get(key) ?? '[]')).toEqual(['job-2']);
  });
});
