import type { DataImportStatus } from '@guallet/api-client';

export function getImportResultCopy(
  status: DataImportStatus | null,
  statusUnavailable = false,
) {
  if (statusUnavailable) {
    return {
      title: 'Status unavailable',
      description:
        'We can no longer check this import. Review your transactions for the result.',
    };
  }
  if (status?.status === 'completed') {
    if (status.failedCount > 0) {
      return {
        title: 'Some rows need attention',
        description: `${status.processedCount} transactions were added. ${status.failedCount} rows could not be imported.`,
      };
    }
    return {
      title: 'Import complete',
      description: `${status.processedCount} transactions were added to Guallet.`,
    };
  }
  if (status?.status === 'failed') {
    return {
      title: 'Import failed',
      description:
        'We could not finish this import. Check your transactions before trying again.',
    };
  }
  return {
    title: 'Import in progress',
    description:
      'Your transactions are being added. You can leave this screen and check back later.',
  };
}
