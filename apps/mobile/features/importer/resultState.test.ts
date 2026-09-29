import { describe, expect, it } from 'vitest';
import { getImportResultCopy } from './resultState';

describe('import submission states', () => {
  it('shows progress while the job is queued', () => {
    expect(
      getImportResultCopy({
        status: 'queued',
        progress: 0,
        processedCount: 0,
        failedCount: 0,
      }).title,
    ).toBe('Import in progress');
  });

  it('distinguishes success from partial success', () => {
    expect(
      getImportResultCopy({
        status: 'completed',
        progress: 100,
        processedCount: 10,
        failedCount: 0,
      }).title,
    ).toBe('Import complete');
    expect(
      getImportResultCopy({
        status: 'completed',
        progress: 100,
        processedCount: 9,
        failedCount: 1,
      }).title,
    ).toBe('Some rows need attention');
  });

  it('shows a failed job as an error', () => {
    expect(
      getImportResultCopy({
        status: 'failed',
        progress: 50,
        processedCount: 0,
        failedCount: 0,
      }).title,
    ).toBe('Import failed');
  });
});
