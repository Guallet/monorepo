import { StyleSheet, Text, View } from 'react-native';
import { useSavingGoals } from '@guallet/api-react';
import { useTheme } from '@guallet/ui-react-native';
import { SavingGoalProgressItem } from './SavingGoalProgressItem';

const MAX_GOALS = 3;

interface SavingGoalsWidgetProps {
  currency?: string;
}

export function SavingGoalsWidget({
  currency = 'GBP',
}: SavingGoalsWidgetProps) {
  const { colors, borderRadius, spacing, typography } = useTheme();
  const { savingGoals, isLoading } = useSavingGoals();

  if (isLoading) {
    return (
      <View
        style={[
          styles.skeleton,
          {
            borderRadius: borderRadius.lg,
            backgroundColor: colors.surface.background.secondary,
          },
        ]}
      />
    );
  }

  const goals = savingGoals.slice(0, MAX_GOALS);

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface.background.primary,
          borderRadius: borderRadius.lg,
          borderColor: colors.surface.border.primary,
          padding: spacing.md,
          gap: spacing.sm,
        },
      ]}
    >
      <Text
        style={[
          styles.title,
          { color: colors.text.primary, fontSize: typography.sizes.lg },
        ]}
      >
        Saving goals
      </Text>

      {goals.length === 0 ? (
        <Text
          style={[
            styles.emptyText,
            { color: colors.text.secondary, fontSize: typography.sizes.sm },
          ]}
        >
          No saving goals yet
        </Text>
      ) : (
        goals.map((goal) => (
          <SavingGoalProgressItem
            key={goal.id}
            goal={goal}
            currency={currency}
          />
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    height: 140,
  },
  card: {
    borderWidth: 1,
  },
  title: {
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    paddingVertical: 8,
  },
});
