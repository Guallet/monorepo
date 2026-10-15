import { describe, expect, it } from 'vitest';
import { ApiError } from '@guallet/api-client';
import { isPermanentImportStatusError } from './importStatusError';

describe('import status errors', () => {
  it.each([401, 403, 404])('stops polling after HTTP %i', (status) => {
    expect(
      isPermanentImportStatusError(new ApiError('Unavailable', status)),
    ).toBe(true);
  });

  it('keeps polling after a transient failure', () => {
    expect(isPermanentImportStatusError(new ApiError('Unavailable', 503))).toBe(
      false,
    );
    expect(isPermanentImportStatusError(new Error('Network unavailable'))).toBe(
      false,
    );
  });
});
