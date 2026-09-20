import { StyleSheet, Text, View } from 'react-native';
import { SavingGoalDto } from '@guallet/api-client';
import { useTheme } from '@guallet/luna-ui';

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

interface SavingGoalProgressItemProps {
  goal: SavingGoalDto;
  currency?: string;
}

export function SavingGoalProgressItem({
  goal,
  currency = 'GBP',
}: SavingGoalProgressItemProps) {
  const { colors, spacing, typography } = useTheme();
  const progressPct = Math.min(100, Math.max(0, goal.progressPercentage));

  return (
    <View style={[styles.container, { gap: spacing.xs }]}>
      <View style={styles.labelRow}>
        <Text
          style={[
            styles.name,
            { color: colors.text.primary, fontSize: typography.sizes.sm },
          ]}
          numberOfLines={1}
        >
          {goal.name}
        </Text>
        <Text
          style={[
            styles.amounts,
            { color: colors.text.secondary, fontSize: typography.sizes.xs },
          ]}
        >
          {formatCurrency(goal.currentAmount, currency)} /{' '}
          {formatCurrency(goal.targetAmount, currency)}
        </Text>
      </View>

      <View
        style={[
          styles.track,
          { backgroundColor: colors.surface.border.primary },
        ]}
      >
        <View
          style={[
            styles.fill,
            {
              width: `${progressPct}%`,
              backgroundColor: goal.isCompleted
                ? colors.status.success
                : colors.support.primary,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    fontWeight: '600',
    flex: 1,
  },
  amounts: {
    fontVariant: ['tabular-nums'],
    flexShrink: 0,
  },
  track: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: 6,
    borderRadius: 3,
  },
});
