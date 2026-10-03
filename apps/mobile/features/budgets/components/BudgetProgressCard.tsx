import type { BudgetDto } from '@guallet/api-client';
import { useTheme } from '@guallet/luna-mobile';
import { CashIcon, CategoryIcon } from '@guallet/luna-mobile/icons';
import { StyleSheet, Text, View } from 'react-native';
import {
  formatBudgetCurrency,
  getBudgetMetrics,
  getProgressColor,
} from '../models';

export function BudgetProgressCard({
  budget,
  categoryNames,
}: Readonly<{ budget: BudgetDto; categoryNames: string[] }>) {
  const { borderRadius, colors, spacing, typography } = useTheme();
  const metrics = getBudgetMetrics(budget);
  const progressColor = getProgressColor(metrics, colors);
  const overBudget = metrics.remaining < 0;
  const atLimit = metrics.remaining === 0;
  let status = 'On track';
  if (metrics.isNearLimit) status = 'Near limit';
  if (atLimit) status = 'Limit reached';
  if (overBudget) status = 'Over budget';

  let amountLabel = 'remaining this month';
  if (overBudget) amountLabel = 'over the monthly limit';

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
      <View style={[styles.heading, { gap: spacing.sm }]}>
        <View
          accessible={false}
          style={[
            styles.icon,
            {
              backgroundColor: budget.colour ?? colors.accent.primary,
              borderRadius: borderRadius.md,
            },
          ]}
        >
          {budget.icon ? (
            <CategoryIcon
              color={colors.neutral.white}
              name={budget.icon}
              size={22}
            />
          ) : (
            <CashIcon color={colors.neutral.white} size={22} />
          )}
        </View>
        <Text
          accessibilityRole="header"
          numberOfLines={1}
          style={[
            styles.name,
            { color: colors.text.primary, fontSize: typography.sizes.md },
          ]}
        >
          {budget.name}
        </Text>
        <View
          style={[
            styles.status,
            {
              backgroundColor: colors.surface.background.secondary,
              borderRadius: borderRadius.xl,
              paddingHorizontal: spacing.sm,
              paddingVertical: spacing.xs,
            },
          ]}
        >
          <Text
            style={{
              color: overBudget ? colors.status.error : colors.text.secondary,
              fontSize: typography.sizes.xs,
              fontWeight: '600',
            }}
          >
            {status}
          </Text>
        </View>
      </View>

      <Text
        style={[
          styles.amount,
          {
            color: overBudget ? colors.status.error : colors.text.primary,
            fontSize: typography.sizes.xxl,
            marginTop: spacing.lg,
          },
        ]}
      >
        {formatBudgetCurrency(Math.abs(metrics.remaining), budget.currency)}
      </Text>
      <Text
        style={{ color: colors.text.secondary, fontSize: typography.sizes.sm }}
      >
        {amountLabel}
      </Text>

      <View
        accessibilityLabel={`${Math.min(metrics.percent, 100).toFixed(0)} percent used`}
        accessibilityRole="progressbar"
        accessibilityValue={{
          min: 0,
          max: 100,
          now: Math.min(metrics.percent, 100),
        }}
        style={[
          styles.progressTrack,
          {
            backgroundColor: colors.surface.background.secondary,
            borderRadius: borderRadius.xs,
            marginTop: spacing.md,
          },
        ]}
      >
        <View
          style={[
            styles.progressValue,
            {
              backgroundColor: progressColor,
              borderRadius: borderRadius.xs,
              width: `${Math.min(metrics.percent, 100)}%`,
            },
          ]}
        />
      </View>
      <View style={[styles.totals, { marginTop: spacing.sm }]}>
        <Text
          style={{
            color: colors.text.secondary,
            fontSize: typography.sizes.sm,
            fontVariant: ['tabular-nums'],
          }}
        >
          {formatBudgetCurrency(metrics.spent, budget.currency)} spent
        </Text>
        <Text
          style={{
            color: colors.text.secondary,
            fontSize: typography.sizes.sm,
            fontVariant: ['tabular-nums'],
          }}
        >
          {formatBudgetCurrency(metrics.amount, budget.currency)} budgeted
        </Text>
      </View>
      {categoryNames.length > 0 && (
        <Text
          numberOfLines={2}
          style={{
            color: colors.text.secondary,
            fontSize: typography.sizes.xs,
            marginTop: spacing.md,
          }}
        >
          Tracks {categoryNames.join(', ')}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  heading: { alignItems: 'center', flexDirection: 'row' },
  icon: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  name: { flex: 1, fontWeight: '700' },
  status: { flexShrink: 0 },
  amount: { fontVariant: ['tabular-nums'], fontWeight: '700' },
  progressTrack: { height: 10, overflow: 'hidden' },
  progressValue: { height: '100%' },
  totals: { flexDirection: 'row', justifyContent: 'space-between' },
});
