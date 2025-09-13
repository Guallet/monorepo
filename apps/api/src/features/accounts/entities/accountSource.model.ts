export enum AccountSource {
  MANUAL = 'manual',
  IMPORTED = 'imported',
  SYNCED = 'synced',
  UNKNOWN = 'unknown',
}

export function toAccountSource(value: string): AccountSource {
  return Object.values(AccountSource).includes(value as AccountSource)
    ? (value as AccountSource)
    : AccountSource.UNKNOWN;
}
