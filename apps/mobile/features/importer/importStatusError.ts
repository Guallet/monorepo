import { ApiError } from '@guallet/api-client';

export function isPermanentImportStatusError(error: unknown): boolean {
  return (
    error instanceof ApiError &&
    (error.status === 401 || error.status === 403 || error.status === 404)
  );
}
