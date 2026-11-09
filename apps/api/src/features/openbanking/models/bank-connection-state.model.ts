export const BANK_CONNECTION_STATUSES = [
  'connected',
  'expired',
  'connectionError',
] as const;

export type BankConnectionStatus = (typeof BANK_CONNECTION_STATUSES)[number];

export type BankConnectionError = {
  // null means the operation failed for the whole connection.
  accountIds: string[] | null;
};

export function connectionStatusFromProvider(
  status?: string | null,
): BankConnectionStatus {
  const normalized = status?.replace(/[\s-]/g, '_').toUpperCase();
  if (['EXPIRED', 'EX', 'CONSENT_EXPIRED'].includes(normalized ?? '')) {
    return 'expired';
  }
  if (
    normalized &&
    !['ACTIVE', 'CONNECTED', 'READY', 'LN', 'HEALTHY'].includes(normalized)
  ) {
    return 'connectionError';
  }
  return 'connected';
}

export function validDate(value?: string | Date | null): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date : null;
}
