import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { SavingGoalDto } from '@guallet/api-client';
import { useTheme } from '@guallet/luna-mobile';
import {
  formatGoalAmount,
  goalProgress,
  goalStatus,
} from '../models/savingGoal';
import { useTranslation } from 'react-i18next';

type Props = { goal: SavingGoalDto; onPress: () => void; accountNames: string };

export function GoalCard({ goal, onPress, accountNames }: Readonly<Props>) {
  const { t } = useTranslation();
  const { colors, borderRadius, spacing, typography } = useTheme();
  const progress = goalProgress(goal);
  const status = goalStatus(goal);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('{{name}}, {{progress}} percent complete', {
        name: goal.name,
        progress: Math.round(progress),
      })}
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: colors.surface.background.primary,
          borderColor: colors.surface.border.primary,
          borderRadius: borderRadius.lg,
          padding: spacing.md,
          gap: spacing.sm,
        },
      ]}
    >
      <View style={styles.row}>
        <Text
          numberOfLines={1}
          style={[
            styles.name,
            { color: colors.text.primary, fontSize: typography.sizes.lg },
          ]}
        >
          {goal.name}
        </Text>
        {status && (
          <Text
            style={{
              color: goal.isOverdue
                ? colors.status.error
                : colors.status.success,
              fontSize: typography.sizes.xs,
              fontWeight: '600',
            }}
          >
            {status}
          </Text>
        )}
      </View>
      <View
        accessible
        accessibilityRole="progressbar"
        accessibilityLabel={t('{{name}} progress', { name: goal.name })}
        accessibilityValue={{ min: 0, max: 100, now: progress }}
        style={[
          styles.track,
          { backgroundColor: colors.surface.border.primary },
        ]}
      >
        <View
          style={[
            styles.fill,
            {
              width: `${progress}%`,
              backgroundColor: goal.isCompleted
                ? colors.status.success
                : colors.accent.primary,
            },
          ]}
        />
      </View>
      <View style={styles.row}>
        <Text
          style={{
            color: colors.text.secondary,
            fontSize: typography.sizes.sm,
          }}
        >
          <Text
            style={[
              styles.money,
              {
                color:
                  goal.currentAmount < 0
                    ? colors.status.error
                    : colors.support.primary,
              },
            ]}
          >
            {formatGoalAmount(goal.currentAmount, goal.currency)}
          </Text>{' '}
          {t('copy_t6uqnc')}
          {formatGoalAmount(goal.targetAmount, goal.currency)}
        </Text>
        <Text style={{ color: colors.accent.primary, fontWeight: '700' }}>
          {Math.round(progress)}%
        </Text>
      </View>
      <Text
        numberOfLines={1}
        style={{ color: colors.text.secondary, fontSize: typography.sizes.xs }}
      >
        {accountNames}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  name: { flex: 1, fontWeight: '700' },
  track: { height: 8, borderRadius: 4, overflow: 'hidden' },
  fill: { height: 8, borderRadius: 4 },
  money: { fontWeight: '700', fontVariant: ['tabular-nums'] },
});
