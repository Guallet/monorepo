import { Worker } from 'node:worker_threads';
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
): boolean | Promise<boolean> {
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
      return evaluateRegexInWorker(value, fieldValue);
    default:
      return false;
  }
}

const REGEX_TIMEOUT_MS = 50;
const MAX_REGEX_PATTERN_LENGTH = 1_000;
const MAX_REGEX_INPUT_LENGTH = 10_000;

/** Run user regexes away from the API event loop and terminate over-budget work. */
function evaluateRegexInWorker(
  pattern: string,
  input: string,
): Promise<boolean> {
  if (
    pattern.length > MAX_REGEX_PATTERN_LENGTH ||
    input.length > MAX_REGEX_INPUT_LENGTH
  ) {
    return Promise.resolve(false);
  }

  return new Promise((resolve) => {
    const worker = new Worker(
      `const { parentPort } = require('node:worker_threads');
       parentPort.postMessage('ready');
       parentPort.once('message', ({ pattern, input }) => {
         try {
           parentPort.postMessage(new RegExp(pattern, 'i').test(input));
         } catch {
           parentPort.postMessage(false);
         }
       });`,
      { eval: true },
    );
    let settled = false;
    const finish = (result: boolean) => {
      if (settled) return;
      settled = true;
      if (timeout) clearTimeout(timeout);
      void worker.terminate();
      resolve(result);
    };
    let timeout: NodeJS.Timeout | undefined;
    worker.on('message', (result: boolean | 'ready') => {
      if (result === 'ready') {
        timeout = setTimeout(() => finish(false), REGEX_TIMEOUT_MS);
        worker.postMessage({ pattern, input });
      } else {
        finish(result);
      }
    });
    worker.once('error', () => finish(false));
    worker.once('exit', () => finish(false));
  });
}

/**
 * Evaluate number field conditions
 */
export function evaluateNumberCondition(
  fieldValue: number | null | undefined,
  operator: NumberOperatorType,
  value: string,
): boolean {
  if (fieldValue === null || fieldValue === undefined) {
    return false;
  }

  const numericValue = Number.parseFloat(value);
  if (Number.isNaN(numericValue)) {
    return false;
  }

  switch (operator) {
    case NumberOperator.EQUALS:
      return fieldValue === numericValue;
    case NumberOperator.NOT_EQUALS:
      return fieldValue !== numericValue;
    case NumberOperator.GREATER_THAN:
      return fieldValue > numericValue;
    case NumberOperator.LESS_THAN:
      return fieldValue < numericValue;
    case NumberOperator.GREATER_THAN_OR_EQUALS:
      return fieldValue >= numericValue;
    case NumberOperator.LESS_THAN_OR_EQUALS:
      return fieldValue <= numericValue;
    default:
      return false;
  }
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
