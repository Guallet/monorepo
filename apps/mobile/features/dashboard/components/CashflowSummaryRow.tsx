import { useEffect, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTransactionsWithFilter } from '@guallet/api-react';
import { useTheme } from '@guallet/ui-react-native';

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

interface CashflowSummaryRowProps {
  currency?: string;
  onMonthDeltaChange?: (delta: number) => void;
}

export function CashflowSummaryRow({
  currency = 'GBP',
  onMonthDeltaChange,
}: CashflowSummaryRowProps) {
  const { colors, borderRadius, spacing, typography } = useTheme();

  const startDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d;
  }, []);
  const endDate = useMemo(() => new Date(), []);

  const { transactions, isLoading } = useTransactionsWithFilter({
    page: 1,
    pageSize: 500,
    startDate,
    endDate,
  });

  const { income, expense } = useMemo(() => {
    let inc = 0;
    let exp = 0;
    for (const t of transactions) {
      if (t.amount > 0) inc += t.amount;
      else exp += Math.abs(t.amount);
    }
    return { income: inc, expense: exp };
  }, [transactions]);

  useEffect(() => {
    onMonthDeltaChange?.(income - expense);
  }, [expense, income, onMonthDeltaChange]);

  if (isLoading) {
    return (
      <View style={styles.row}>
        <View
          style={[
            styles.skeletonCard,
            { borderRadius: borderRadius.lg, backgroundColor: colors.surface },
          ]}
        />
        <View
          style={[
            styles.skeletonCard,
            { borderRadius: borderRadius.lg, backgroundColor: colors.surface },
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
            backgroundColor: colors.background,
            borderRadius: borderRadius.lg,
            borderColor: colors.border,
            padding: spacing.md,
          },
        ]}
      >
        <Text
          style={[
            styles.cardLabel,
            { color: colors.textSecondary, fontSize: typography.sizes.xs },
          ]}
        >
          INCOME · 30D
        </Text>
        <Text
          style={[
            styles.cardAmount,
            { color: colors.support, fontSize: typography.sizes.xl },
          ]}
        >
          +{formatCurrency(income, currency)}
        </Text>
        <View style={[styles.indicator, { backgroundColor: colors.support }]} />
      </View>

      {/* Expense card */}
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.background,
            borderRadius: borderRadius.lg,
            borderColor: colors.border,
            padding: spacing.md,
          },
        ]}
      >
        <Text
          style={[
            styles.cardLabel,
            { color: colors.textSecondary, fontSize: typography.sizes.xs },
          ]}
        >
          EXPENSE · 30D
        </Text>
        <Text
          style={[
            styles.cardAmount,
            { color: colors.error, fontSize: typography.sizes.xl },
          ]}
        >
          -{formatCurrency(expense, currency)}
        </Text>
        <View style={[styles.indicator, { backgroundColor: colors.error }]} />
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
