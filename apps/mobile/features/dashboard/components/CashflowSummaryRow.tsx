import type { MoneyFormatOptions } from '@guallet/money';
import { Money } from '@guallet/money';
import { useEffect, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTransactionsWithFilter } from '@guallet/api-react';
import { useTheme } from '@guallet/luna-mobile';
import { useDashboardDateRange } from '../hooks/useDashboardDateRange';
import { useMobileUserPreferences } from '@/features/settings/useMobileUserPreferences';
import {
  groupCashflowByCurrency,
  type CurrencyAmount,
} from '../utils/currencyTotals';

function formatCurrency(
  amount: number,
  currency: string,
  options?: MoneyFormatOptions,
): string {
  return Money.fromCurrencyCode({
    amount: amount,
    currencyCode: currency,
  }).format({ locale: 'en-GB', ...options });
}

interface CashflowSummaryRowProps {
  onMonthDeltaChange?: (deltas: CurrencyAmount[] | null) => void;
}

export function CashflowSummaryRow({
  onMonthDeltaChange,
}: CashflowSummaryRowProps) {
  const { colors, borderRadius, spacing, typography } = useTheme();
  const { defaultCurrency } = useMobileUserPreferences();

  const { startDate, endDate } = useDashboardDateRange({ daysAgo: 30 });

  const { transactions, isLoading } = useTransactionsWithFilter({
    page: 1,
    pageSize: 500,
    startDate,
    endDate,
  });

  const cashflow = useMemo(
    () => groupCashflowByCurrency(transactions, defaultCurrency),
    [defaultCurrency, transactions],
  );

  useEffect(() => {
    onMonthDeltaChange?.(
      isLoading
        ? null
        : cashflow.map(({ currency, income, expense }) => ({
            currency,
            amount: income - expense,
          })),
    );
  }, [cashflow, isLoading, onMonthDeltaChange]);

  if (isLoading) {
    return (
      <View style={styles.row}>
        <View
          style={[
            styles.skeletonCard,
            {
              borderRadius: borderRadius.lg,
              backgroundColor: colors.surface.background.secondary,
            },
          ]}
        />
        <View
          style={[
            styles.skeletonCard,
            {
              borderRadius: borderRadius.lg,
              backgroundColor: colors.surface.background.secondary,
            },
          ]}
        />
      </View>
    );
  }

  return (
    <View style={[styles.row, { gap: spacing.sm }]}>
      {/* Income card */}
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.surface.background.primary,
            borderRadius: borderRadius.lg,
            borderColor: colors.surface.border.primary,
            padding: spacing.md,
          },
        ]}
      >
        <Text
          style={[
            styles.cardLabel,
            { color: colors.text.secondary, fontSize: typography.sizes.xs },
          ]}
        >
          INCOME · 30D
        </Text>
        {cashflow.map(({ currency, income }) => (
          <Text
            key={currency}
            style={[
              styles.cardAmount,
              {
                color: colors.support.primary,
                fontSize: typography.sizes.xl,
              },
            ]}
          >
            +{formatCurrency(income, currency)}
          </Text>
        ))}
        <View
          style={[
            styles.indicator,
            { backgroundColor: colors.support.primary },
          ]}
        />
      </View>

      {/* Expense card */}
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.surface.background.primary,
            borderRadius: borderRadius.lg,
            borderColor: colors.surface.border.primary,
            padding: spacing.md,
          },
        ]}
      >
        <Text
          style={[
            styles.cardLabel,
            { color: colors.text.secondary, fontSize: typography.sizes.xs },
          ]}
        >
          EXPENSE · 30D
        </Text>
        {cashflow.map(({ currency, expense }) => (
          <Text
            key={currency}
            style={[
              styles.cardAmount,
              {
                color: colors.status.error,
                fontSize: typography.sizes.xl,
              },
            ]}
          >
            -{formatCurrency(expense, currency)}
          </Text>
        ))}
        <View
          style={[styles.indicator, { backgroundColor: colors.status.error }]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
  },
  card: {
    flex: 1,
    borderWidth: 1,
    gap: 4,
  },
  cardLabel: {
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  cardAmount: {
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  indicator: {
    height: 3,
    borderRadius: 2,
    marginTop: 8,
  },
  skeletonCard: {
    flex: 1,
    height: 90,
  },
});
