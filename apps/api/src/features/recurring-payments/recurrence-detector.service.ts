import { Injectable, Logger } from '@nestjs/common';
import { Transaction } from '../transactions/entities/transaction.entity';
import { RecurrenceCadence } from './entities/recurring-payment.entity';
import { DetectedRecurringPaymentDto } from './dto/detected-recurring-payment.dto';

interface TransactionGroup {
  description: string;
  transactions: Transaction[];
  categoryId?: string;
}

@Injectable()
export class RecurrenceDetectorService {
  private readonly logger = new Logger(RecurrenceDetectorService.name);

  /**
   * Detect recurring patterns in transactions
   * @param transactions List of transactions to analyze (should be from last 13 months)
   * @returns List of detected recurring payment patterns
   */
  async detectRecurringPatterns(
    transactions: Transaction[],
  ): Promise<DetectedRecurringPaymentDto[]> {
    // Group similar transactions by description
    const groups = this.groupSimilarTransactions(transactions);

    const detectedPatterns: DetectedRecurringPaymentDto[] = [];

    for (const group of groups) {
      // Need at least 3 occurrences to consider it recurring
      if (group.transactions.length < 3) {
        continue;
      }

      // Sort by date
      const sortedTransactions = group.transactions.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      );

      // Analyze intervals between transactions
      const intervals = this.calculateIntervals(sortedTransactions);
      
      if (intervals.length < 2) {
        continue;
      }

      // Detect cadence from intervals
      const cadenceDetection = this.detectCadence(intervals);
      
      if (!cadenceDetection) {
        continue;
      }

      // Calculate confidence score
      const confidenceScore = this.calculateConfidenceScore(
        sortedTransactions,
        intervals,
        cadenceDetection.cadence,
      );

      // Only include if confidence is reasonable (> 0.5)
      if (confidenceScore < 0.5) {
        continue;
      }

      // Calculate average amount
      const averageAmount = this.calculateAverageAmount(sortedTransactions);

      // Estimate next date
      const lastTransaction = sortedTransactions[sortedTransactions.length - 1];
      const nextDate = this.calculateNextDate(
        lastTransaction.date,
        cadenceDetection.cadence,
      );

      detectedPatterns.push({
        description: group.description,
        averageAmount,
        currency: sortedTransactions[0].currency,
        suggestedCadence: cadenceDetection.cadence,
        nextExpectedDate: nextDate,
        confidenceScore,
        occurrenceCount: sortedTransactions.length,
        transactionIds: sortedTransactions.map((t) => t.id),
        categoryId: group.categoryId,
        category: sortedTransactions[0].category ? {
          id: sortedTransactions[0].category.id,
          name: sortedTransactions[0].category.name,
          icon: sortedTransactions[0].category.icon,
          colour: sortedTransactions[0].category.colour,
        } : undefined,
      });
    }

    // Sort by confidence score (highest first)
    return detectedPatterns.sort((a, b) => b.confidenceScore - a.confidenceScore);
  }

  private groupSimilarTransactions(
    transactions: Transaction[],
  ): TransactionGroup[] {
    const groups = new Map<string, TransactionGroup>();

    for (const transaction of transactions) {
      if (!transaction.description) {
        continue;
      }

      // Normalize description for grouping
      const normalizedDesc = this.normalizeDescription(transaction.description);

      if (!groups.has(normalizedDesc)) {
        groups.set(normalizedDesc, {
          description: transaction.description,
          transactions: [],
          categoryId: transaction.categoryId,
        });
      }

      groups.get(normalizedDesc)!.transactions.push(transaction);
    }

    return Array.from(groups.values());
  }

  private normalizeDescription(description: string): string {
    // Remove common patterns like dates, transaction IDs, etc.
    return description
      .toLowerCase()
      .replace(/\d{2}\/\d{2}\/\d{4}/g, '') // Remove dates
      .replace(/\d{4}-\d{2}-\d{2}/g, '') // Remove ISO dates
      .replace(/\d{2}-\d{2}-\d{4}/g, '') // Remove dates
      .replace(/\b\d{6,}\b/g, '') // Remove long numbers (likely transaction IDs)
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  private calculateIntervals(transactions: Transaction[]): number[] {
    const intervals: number[] = [];

    for (let i = 1; i < transactions.length; i++) {
      const prevDate = new Date(transactions[i - 1].date);
      const currDate = new Date(transactions[i].date);
      const daysDiff = Math.round(
        (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24),
      );
      intervals.push(daysDiff);
    }

    return intervals;
  }

  private detectCadence(
    intervals: number[],
  ): { cadence: RecurrenceCadence; expectedInterval: number } | null {
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;

    // Define cadence ranges with tolerance
    const cadenceRanges: Array<{
      cadence: RecurrenceCadence;
      min: number;
      max: number;
      expected: number;
    }> = [
      { cadence: RecurrenceCadence.WEEKLY, min: 5, max: 9, expected: 7 },
      { cadence: RecurrenceCadence.BIWEEKLY, min: 12, max: 16, expected: 14 },
      { cadence: RecurrenceCadence.MONTHLY, min: 25, max: 35, expected: 30 },
      { cadence: RecurrenceCadence.QUARTERLY, min: 85, max: 95, expected: 90 },
      { cadence: RecurrenceCadence.YEARLY, min: 350, max: 380, expected: 365 },
    ];

    for (const range of cadenceRanges) {
      if (avgInterval >= range.min && avgInterval <= range.max) {
        return { cadence: range.cadence, expectedInterval: range.expected };
      }
    }

    return null;
  }

  private calculateConfidenceScore(
    transactions: Transaction[],
    intervals: number[],
    cadence: RecurrenceCadence,
  ): number {
    let score = 0;

    // Factor 1: Number of occurrences (more is better)
    // 3 occurrences = 0.3, 6+ occurrences = 0.4
    const occurrenceScore = Math.min(0.4, transactions.length * 0.1);
    score += occurrenceScore;

    // Factor 2: Consistency of intervals (lower variance is better)
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance =
      intervals.reduce((sum, interval) => sum + Math.pow(interval - avgInterval, 2), 0) /
      intervals.length;
    const stdDev = Math.sqrt(variance);
    const consistencyScore = Math.max(0, 0.3 - (stdDev / avgInterval) * 0.3);
    score += consistencyScore;

    // Factor 3: Amount consistency
    const amounts = transactions.map((t) => Math.abs(Number(t.amount)));
    const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const amountVariance =
      amounts.reduce((sum, amt) => sum + Math.pow(amt - avgAmount, 2), 0) /
      amounts.length;
    const amountStdDev = Math.sqrt(amountVariance);
    const amountConsistencyScore = Math.max(0, 0.3 - (amountStdDev / avgAmount) * 0.3);
    score += amountConsistencyScore;

    return Math.min(1, score);
  }

  private calculateAverageAmount(transactions: Transaction[]): number {
    const amounts = transactions.map((t) => Math.abs(Number(t.amount)));
    return amounts.reduce((a, b) => a + b, 0) / amounts.length;
  }

  private calculateNextDate(lastDate: Date, cadence: RecurrenceCadence): Date {
    const nextDate = new Date(lastDate);

    switch (cadence) {
      case RecurrenceCadence.WEEKLY:
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case RecurrenceCadence.BIWEEKLY:
        nextDate.setDate(nextDate.getDate() + 14);
        break;
      case RecurrenceCadence.MONTHLY:
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      case RecurrenceCadence.QUARTERLY:
        nextDate.setMonth(nextDate.getMonth() + 3);
        break;
      case RecurrenceCadence.YEARLY:
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        break;
    }

    return nextDate;
  }
}
