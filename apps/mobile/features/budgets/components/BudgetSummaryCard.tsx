import type { BudgetDto } from '@guallet/api-client';
import { useTheme } from '@guallet/luna-mobile';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { formatBudgetCurrency, getBudgetMetrics } from '../models';

interface BudgetSummaryCardProps {
  budgets: BudgetDto[];
}

type CurrencySummary = {
  currency: string;
  budgeted: number;
  spent: number;
  remaining: number;
};

export function BudgetSummaryCard({
  budgets,
}: Readonly<BudgetSummaryCardProps>) {
  const { borderRadius, colors, spacing, typography } = useTheme();
  const summaries = useMemo(() => {
    const grouped = new Map<string, CurrencySummary>();

    budgets.forEach((budget) => {
      const current = grouped.get(budget.currency) ?? {
        budgeted: 0,
        currency: budget.currency,
        remaining: 0,
        spent: 0,
      };
      const metrics = getBudgetMetrics(budget);
      current.budgeted += metrics.amount;
      current.spent += metrics.spent;
      current.remaining += metrics.remaining;
      grouped.set(budget.currency, current);
    });

    return [...grouped.values()];
  }, [budgets]);

  const hasSingleCurrency = summaries.length === 1;
  let totalBudgeted = 0;
  let totalSpent = 0;
  if (hasSingleCurrency) {
    const summary = summaries[0];
    totalBudgeted = summary?.budgeted ?? 0;
    totalSpent = summary?.spent ?? 0;
  }
  let overallPercent = 0;
  if (totalBudgeted > 0) overallPercent = (totalSpent / totalBudgeted) * 100;
  const progressColor = getSummaryProgressColor(overallPercent, colors);

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface.background.primary,
          borderColor: colors.surface.border.primary,
          borderRadius: borderRadius.lg,
          padding: spacing.md,
        },
      ]}
    >
      <Text
        style={[
          styles.eyebrow,
          { color: colors.text.secondary, fontSize: typography.sizes.xs },
        ]}
      >
        BUDGET OVERVIEW
      </Text>

      {hasSingleCurrency && (
        <>
          <View
            style={[
              styles.progressTrack,
              {
                backgroundColor: colors.surface.background.secondary,
                borderRadius: borderRadius.xs,
                marginTop: spacing.sm,
              },
            ]}
          >
            <View
              style={[
                styles.progressValue,
                {
                  backgroundColor: progressColor,
                  borderRadius: borderRadius.xs,
                  width: `${Math.min(overallPercent, 100)}%`,
                },
              ]}
            />
          </View>

          <View style={[styles.progressMeta, { marginTop: spacing.xs }]}>
            <Text
              style={{
                color: colors.text.secondary,
                fontSize: typography.sizes.xs,
              }}
            >
              {budgets.length} {getBudgetLabel(budgets.length)}
            </Text>
            <Text
              style={{
                color: progressColor,
                fontSize: typography.sizes.xs,
                fontWeight: '600',
              }}
            >
              {Math.min(overallPercent, 100).toFixed(0)}% used
            </Text>
          </View>
        </>
      )}
      {!hasSingleCurrency && (
        <Text
          style={{
            color: colors.text.secondary,
            fontSize: typography.sizes.xs,
            marginTop: spacing.sm,
          }}
        >
          {budgets.length} budgets · Multiple currencies
        </Text>
      )}

      <View
        style={[
          styles.divider,
          {
            backgroundColor: colors.surface.border.primary,
            marginVertical: spacing.md,
          },
        ]}
      />

      {summaries.map((summary) => (
        <View
          key={summary.currency}
          style={[styles.currencyBlock, { gap: spacing.sm }]}
        >
          {summaries.length > 1 && (
            <Text
              style={{
                color: colors.text.secondary,
                fontSize: typography.sizes.xs,
              }}
            >
              {summary.currency}
            </Text>
          )}
          <View style={[styles.stats, { gap: spacing.sm }]}>
            <SummaryStat
              label="Budgeted"
              value={formatBudgetCurrency(summary.budgeted, summary.currency)}
            />
            <SummaryStat
              color={colors.status.error}
              label="Spent"
              value={formatBudgetCurrency(summary.spent, summary.currency)}
            />
            <SummaryStat
              align="right"
              color={getRemainingColor(summary.remaining, colors)}
              label={getRemainingLabel(summary.remaining)}
              value={formatBudgetCurrency(
                Math.abs(summary.remaining),
                summary.currency,
              )}
            />
          </View>
        </View>
      ))}
    </View>
  );
}

function getSummaryProgressColor(
  percent: number,
  colors: ReturnType<typeof useTheme>['colors'],
): string {
  if (percent >= 100) return colors.status.error;
  if (percent >= 80) return colors.status.warning;
  return colors.support.primary;
}

function getBudgetLabel(count: number): string {
  if (count === 1) return 'budget';
  return 'budgets';
}

function getRemainingColor(
  remaining: number,
  colors: ReturnType<typeof useTheme>['colors'],
): string {
  if (remaining >= 0) return colors.support.primary;
  return colors.status.error;
}

function getRemainingLabel(remaining: number): string {
  if (remaining < 0) return 'Over budget';
  return 'Remaining';
}

function SummaryStat({
  align = 'left',
  color,
  label,
  value,
}: Readonly<{
  align?: 'left' | 'right';
  color?: string;
  label: string;
  value: string;
}>) {
  const { colors, typography } = useTheme();

  return (
    <View style={[styles.stat, align === 'right' && styles.statRight]}>
      <Text
        style={{ color: colors.text.secondary, fontSize: typography.sizes.xs }}
      >
        {label}
      </Text>
      <Text
        numberOfLines={1}
        style={{
          color: color ?? colors.text.primary,
          fontSize: typography.sizes.sm,
          fontWeight: '700',
        }}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
  },
  eyebrow: {
    fontWeight: '700',
    letterSpacing: 1,
  },
  progressTrack: {
    height: 10,
    overflow: 'hidden',
  },
  progressValue: {
    height: '100%',
  },
  progressMeta: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
  currencyBlock: {
    marginBottom: 8,
  },
  stats: {
    flexDirection: 'row',
  },
  stat: {
    flex: 1,
    gap: 2,
  },
  statRight: {
    alignItems: 'flex-end',
  },
});
