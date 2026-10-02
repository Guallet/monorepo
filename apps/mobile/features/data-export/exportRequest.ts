import type {
  DataExportRequest,
  DataExportResponse,
} from '@guallet/api-client';
import type { DateRange } from '@guallet/luna-mobile';

export type ExportFormat = NonNullable<DataExportRequest['format']>;

export interface ExportSelection {
  accountIds: string[];
  dateRange: DateRange | null;
  format: ExportFormat;
}

/** Encode the selected calendar day for the API's server-local day filter. */
function toServerLocalDateTime(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}T00:00:00`;
}

/** Copy submitted values so later picker edits cannot change the summary. */
export function snapshotExportSelection(
  selection: ExportSelection,
): ExportSelection {
  return {
    accountIds: [...selection.accountIds],
    dateRange: selection.dateRange
      ? {
          startDate: new Date(selection.dateRange.startDate),
          endDate: new Date(selection.dateRange.endDate),
        }
      : null,
    format: selection.format,
  };
}

export function buildExportRequest(
  selection: ExportSelection,
): DataExportRequest {
  const { accountIds, dateRange, format } = selection;
  if (
    dateRange &&
    (!Number.isFinite(dateRange.startDate.getTime()) ||
      !Number.isFinite(dateRange.endDate.getTime()) ||
      dateRange.startDate > dateRange.endDate)
  ) {
    throw new Error('Choose an end date on or after the start date.');
  }

  return {
    ...(accountIds.length > 0 && { accounts: [...accountIds] }),
    ...(dateRange && {
      startDate: toServerLocalDateTime(dateRange.startDate),
      endDate: toServerLocalDateTime(dateRange.endDate),
    }),
    format,
  };
}

export type ExportSubmissionResult =
  | { status: 'accepted' }
  | { status: 'failed'; error: unknown };

/** An accepted request means the API queued the job, not that it finished. */
export async function submitExportRequest(
  exportData: (request: DataExportRequest) => Promise<DataExportResponse>,
  selection: ExportSelection,
): Promise<ExportSubmissionResult> {
  try {
    await exportData(buildExportRequest(selection));
    return { status: 'accepted' };
  } catch (error) {
    return { status: 'failed', error };
  }
}
