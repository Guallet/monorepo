/**
 * TypeORM `decimal` columns are returned as strings at runtime even though the
 * entity type is `number`.  This helper coerces any value to a finite number,
 * defaulting to 0 when parsing fails, so every export engine produces
 * consistent numeric amounts.
 */
export function normalizeAmount(amount: number | string): number {
  const parsed =
    typeof amount === 'number' ? amount : Number.parseFloat(amount);
  return Number.isFinite(parsed) ? parsed : 0;
}
