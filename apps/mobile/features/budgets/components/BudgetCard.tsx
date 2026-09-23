import { Ionicons } from '@expo/vector-icons';
import type { BudgetDto } from '@guallet/api-client';
import { useTheme } from '@guallet/luna-mobile';
import { CashIcon, CategoryIcon } from '@guallet/luna-mobile/icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  formatBudgetCurrency,
  getBudgetMetrics,
  getProgressColor,
} from '../models';

interface BudgetCardProps {
  budget: BudgetDto;
  onPress?: () => void;
}

export function BudgetCard({ budget, onPress }: Readonly<BudgetCardProps>) {
  const { borderRadius, colors, spacing, typography } = useTheme();
  const metrics = getBudgetMetrics(budget);
  const progressColor = getProgressColor(metrics, colors);
  const progress = Math.min(metrics.percent, 100);
  let remainingLabel = 'left';
  if (metrics.isOverBudget) remainingLabel = 'over budget';
  const remainingAmount = formatBudgetCurrency(
    Math.abs(metrics.remaining),
    budget.currency,
  );

  return (
    <Pressable
      {...getAccessibilityProps(budget.name, onPress)}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.surface.background.primary,
          borderColor: colors.surface.border.primary,
          borderRadius: borderRadius.lg,
          opacity: getPressedOpacity(pressed, Boolean(onPress)),
          padding: spacing.md,
        },
      ]}
    >
      <View style={[styles.header, { gap: spacing.sm }]}>
        <View
          style={[
            styles.icon,
            {
              backgroundColor: budget.colour ?? colors.accent.primary,
              borderRadius: borderRadius.md,
            },
          ]}
        >
          {budget.icon && (
            <CategoryIcon
              color={colors.neutral.white}
              name={budget.icon}
              size={22}
            />
          )}
          {!budget.icon && <CashIcon color={colors.neutral.white} size={22} />}
        </View>

        <View style={styles.nameBlock}>
          <Text
            numberOfLines={1}
            style={[
              styles.name,
              { color: colors.text.primary, fontSize: typography.sizes.md },
            ]}
          >
            {budget.name}
          </Text>
          <Text
            style={{
              color: colors.text.secondary,
              fontSize: typography.sizes.xs,
            }}
          >
            {budget.categories.length}{' '}
            {getCategoryLabel(budget.categories.length)}
          </Text>
        </View>

        <View style={styles.remaining}>
          <Text
            style={[
              styles.remainingAmount,
              {
                color: progressColor,
                fontSize: typography.sizes.sm,
              },
            ]}
          >
            {remainingAmount}
          </Text>
          <Text
            style={{
              color: colors.text.secondary,
              fontSize: typography.sizes.xs,
            }}
          >
            {remainingLabel}
          </Text>
        </View>
      </View>

      <View
        accessibilityLabel={`${progress.toFixed(0)} percent used`}
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
              width: `${progress}%`,
            },
          ]}
        />
      </View>

      <View style={[styles.footer, { marginTop: spacing.xs }]}>
        <Text
          style={{
            color: colors.text.secondary,
            fontSize: typography.sizes.xs,
          }}
        >
          {formatBudgetCurrency(metrics.spent, budget.currency)} of{' '}
          {formatBudgetCurrency(metrics.amount, budget.currency)} spent
        </Text>
        <Text
          style={{
            color: progressColor,
            fontSize: typography.sizes.xs,
            fontWeight: '600',
          }}
        >
          {progress.toFixed(0)}%
        </Text>
      </View>

      {metrics.isOverBudget && (
        <Ionicons
          accessibilityLabel="Over budget"
          color={colors.status.error}
          name="warning-outline"
          size={18}
          style={styles.warningIcon}
        />
      )}
    </Pressable>
  );
}

function getAccessibilityProps(
  budgetName: string,
  onPress: BudgetCardProps['onPress'],
): {
  accessibilityLabel?: string;
  accessibilityRole?: 'button';
} {
  if (!onPress) return {};
  return {
    accessibilityLabel: `Open ${budgetName} budget`,
    accessibilityRole: 'button',
  };
}

function getPressedOpacity(pressed: boolean, enabled: boolean): number {
  if (pressed && enabled) return 0.7;
  return 1;
}

function getCategoryLabel(count: number): string {
  if (count === 1) return 'category';
  return 'categories';
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    position: 'relative',
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
  },
  icon: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  nameBlock: {
    flex: 1,
    gap: 3,
    minWidth: 0,
  },
  name: {
    fontWeight: '600',
  },
  remaining: {
    alignItems: 'flex-end',
    flexShrink: 0,
    gap: 2,
  },
  remainingAmount: {
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  progressTrack: {
    height: 8,
    overflow: 'hidden',
  },
  progressValue: {
    height: '100%',
  },
  footer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  warningIcon: {
    position: 'absolute',
    right: 10,
    top: 10,
  },
});
