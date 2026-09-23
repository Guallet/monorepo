import { TransactionDto } from '@guallet/api-client';
import { DateRangePreset } from './models';

export type MobileTransaction = TransactionDto & { date: Date };

export function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

export function endOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}

export function getDateRange(
  preset: Exclude<DateRangePreset, 'all' | 'custom'>,
  now = new Date(),
): { startDate: Date; endDate: Date } {
  const endDate = endOfDay(now);

  if (preset === 'today') {
    return { startDate: startOfDay(now), endDate };
  }

  if (preset === 'this-month') {
    return {
      startDate: startOfDay(new Date(now.getFullYear(), now.getMonth(), 1)),
      endDate,
    };
  }

  const startDate = startOfDay(new Date(now));
  startDate.setDate(startDate.getDate() - 29);
  return { startDate, endDate };
}

export function formatDateRange(
  startDate: Date | null,
  endDate: Date | null,
): string {
  if (!startDate || !endDate) return 'Date';

  const format = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
  });

  return `${format.format(startDate)} – ${format.format(endDate)}`;
}

export function formatTransactionDate(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function formatCurrency(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(Math.abs(amount));
  } catch {
    return `${Math.abs(amount).toFixed(2)} ${currency}`;
  }
}

export function groupTransactionsByDate(
  transactions: MobileTransaction[],
): Array<{ title: string; data: MobileTransaction[] }> {
  const grouped = new Map<string, MobileTransaction[]>();

  for (const transaction of transactions) {
    const key = [
      transaction.date.getFullYear(),
      transaction.date.getMonth(),
      transaction.date.getDate(),
    ].join('-');
    const current = grouped.get(key) ?? [];
    current.push(transaction);
    grouped.set(key, current);
  }

  return Array.from(grouped.entries()).map(([key, data]) => ({
    title: formatTransactionDate(
      new Date(
        Number(key.split('-')[0]),
        Number(key.split('-')[1]),
        Number(key.split('-')[2]),
      ),
    ),
    data,
  }));
}
