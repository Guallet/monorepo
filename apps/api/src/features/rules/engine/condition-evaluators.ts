import {
  AccountOperator,
  AccountOperatorType,
  DateTimeOperator,
  DateTimeOperatorType,
  NumberOperator,
  NumberOperatorType,
  StringOperator,
  StringOperatorType,
} from './field-types';

/**
 * Evaluate account field conditions
 */
export function evaluateAccountCondition(
  accountId: string | null | undefined,
  operator: AccountOperatorType,
  value: string,
): boolean {
  if (accountId === null || accountId === undefined) {
    return false;
  }

  switch (operator) {
    case AccountOperator.IS:
      return accountId === value;
    case AccountOperator.IS_NOT:
      return accountId !== value;
    case AccountOperator.IS_IN_LIST: {
      const accountIds = value.split(',').map((id) => id.trim());
      return accountIds.includes(accountId);
    }
    case AccountOperator.IS_NOT_IN_LIST: {
      const accountIds = value.split(',').map((id) => id.trim());
      return !accountIds.includes(accountId);
    }
    default:
      return false;
  }
}

/**
 * Evaluate string field conditions
 */
export function evaluateStringCondition(
  fieldValue: string | null | undefined,
  operator: StringOperatorType,
  value: string,
): boolean {
  if (fieldValue === null || fieldValue === undefined) {
    return false;
  }

  const normalizedFieldValue = fieldValue.toLowerCase();
  const normalizedValue = value.toLowerCase();

  switch (operator) {
    case StringOperator.EQUALS:
      return normalizedFieldValue === normalizedValue;
    case StringOperator.NOT_EQUALS:
      return normalizedFieldValue !== normalizedValue;
    case StringOperator.CONTAINS:
      return normalizedFieldValue.includes(normalizedValue);
    case StringOperator.MATCHES:
      try {
        const regex = new RegExp(value, 'i');
        return regex.test(fieldValue);
      } catch {
        // Invalid regex pattern
        return false;
      }
    default:
      return false;
  }
}

/**
 * Evaluate number field conditions
 */
export function evaluateNumberCondition(
  fieldValue: number | string | null | undefined,
  operator: NumberOperatorType,
  value: string,
): boolean {
  if (fieldValue === null || fieldValue === undefined) {
    return false;
  }

  const comparison = compareDecimalValues(fieldValue, value);
  if (comparison === null) {
    return false;
  }

  switch (operator) {
    case NumberOperator.EQUALS:
      return comparison === 0;
    case NumberOperator.NOT_EQUALS:
      return comparison !== 0;
    case NumberOperator.GREATER_THAN:
      return comparison > 0;
    case NumberOperator.LESS_THAN:
      return comparison < 0;
    case NumberOperator.GREATER_THAN_OR_EQUALS:
      return comparison >= 0;
    case NumberOperator.LESS_THAN_OR_EQUALS:
      return comparison <= 0;
    default:
      return false;
  }
}

/** Compare decimal text exactly, without converting PostgreSQL decimals to floats. */
function compareDecimalValues(
  left: number | string,
  right: string,
): number | null {
  const leftDecimal = parseDecimal(left);
  const rightDecimal = parseDecimal(right);
  if (!leftDecimal || !rightDecimal) return null;

  const scale = Math.max(leftDecimal.scale, rightDecimal.scale);
  const leftInteger =
    leftDecimal.coefficient * 10n ** BigInt(scale - leftDecimal.scale);
  const rightInteger =
    rightDecimal.coefficient * 10n ** BigInt(scale - rightDecimal.scale);
  return leftInteger < rightInteger ? -1 : leftInteger > rightInteger ? 1 : 0;
}

function parseDecimal(
  value: number | string,
): { coefficient: bigint; scale: number } | null {
  const text = String(value).trim();
  const match = /^([+-]?)(\d+)(?:\.(\d*))?(?:[eE]([+-]?\d+))?$/.exec(text);
  if (!match) return null;

  const fraction = match[3] ?? '';
  const exponent = Number(match[4] ?? 0);
  if (!Number.isSafeInteger(exponent) || Math.abs(exponent) > 1000) return null;
  const digits = `${match[2]}${fraction}`;
  let coefficient = BigInt(digits) * (match[1] === '-' ? -1n : 1n);
  let scale = fraction.length - exponent;
  if (scale < 0) {
    coefficient *= 10n ** BigInt(-scale);
    scale = 0;
  }
  return { coefficient, scale };
}

/**
 * Parse date from various formats
 */
function parseDate(dateStr: string): Date | null {
  const parsed = new Date(dateStr);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/**
 * Compare dates at day precision (ignoring time)
 */
function compareDatesAtDayPrecision(date1: Date, date2: Date): number {
  const d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
  const d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
  return d1.getTime() - d2.getTime();
}

/**
 * Evaluate datetime field conditions
 */
export function evaluateDateTimeCondition(
  fieldValue: Date | string | null | undefined,
  operator: DateTimeOperatorType,
  value: string,
): boolean {
  if (fieldValue === null || fieldValue === undefined) {
    return false;
  }

  const fieldDate =
    fieldValue instanceof Date ? fieldValue : parseDate(fieldValue);
  if (!fieldDate) {
    return false;
  }

  switch (operator) {
    case DateTimeOperator.EQUALS: {
      const compareDate = parseDate(value);
      if (!compareDate) return false;
      return compareDatesAtDayPrecision(fieldDate, compareDate) === 0;
    }
    case DateTimeOperator.NOT_EQUALS: {
      const compareDate = parseDate(value);
      if (!compareDate) return false;
      return compareDatesAtDayPrecision(fieldDate, compareDate) !== 0;
    }
    case DateTimeOperator.BEFORE: {
      const compareDate = parseDate(value);
      if (!compareDate) return false;
      return compareDatesAtDayPrecision(fieldDate, compareDate) < 0;
    }
    case DateTimeOperator.AFTER: {
      const compareDate = parseDate(value);
      if (!compareDate) return false;
      return compareDatesAtDayPrecision(fieldDate, compareDate) > 0;
    }
    case DateTimeOperator.BETWEEN: {
      // Value format: "2024-01-01,2024-12-31"
      const [startStr, endStr] = value.split(',').map((s) => s.trim());
      const startDate = parseDate(startStr);
      const endDate = parseDate(endStr);
      if (!startDate || !endDate) return false;
      return (
        compareDatesAtDayPrecision(fieldDate, startDate) >= 0 &&
        compareDatesAtDayPrecision(fieldDate, endDate) <= 0
      );
    }
    default:
      return false;
  }
}
