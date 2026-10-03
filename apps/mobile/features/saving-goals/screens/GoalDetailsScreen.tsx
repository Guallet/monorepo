import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ApiError } from '@guallet/api-client';
import {
  useAccounts,
  useSavingGoal,
  useSavingGoalMutations,
} from '@guallet/api-react';
import { Button, useAlert, useTheme } from '@guallet/luna-mobile';
import { AppScreen } from '@/components/layout/AppScreen';
import { useMobileUserPreferences } from '@/features/settings/useMobileUserPreferences';
import { formatPreferenceDate } from '@/utils/formatPreferenceDate';
import {
  formatGoalAmount,
  goalProgress,
  goalStatus,
} from '../models/savingGoal';

export default function GoalDetailsScreen() {
  const { id: rawId } = useLocalSearchParams<{ id: string | string[] }>();
  const id = Array.isArray(rawId) ? (rawId[0] ?? '') : (rawId ?? '');
  const router = useRouter();
  const { colors, spacing, typography, borderRadius } = useTheme();
  const showAlert = useAlert();
  const { dateFormat } = useMobileUserPreferences();
  const {
    savingGoal: goal,
    isLoading,
    isError,
    error,
    refetch,
  } = useSavingGoal(id);
  const { accounts } = useAccounts();
  const { deleteSavingGoalMutation } = useSavingGoalMutations();

  function confirmDelete() {
    if (!goal) return;
    showAlert({
      title: `Delete “${goal.name}”?`,
      message:
        'This goal and its progress will be removed. Linked account balances will stay as they are.',
      actions: [
        { text: 'Keep goal', style: 'cancel' },
        {
          text: 'Delete goal',
          style: 'destructive',
          onPress: () => {
            void deleteSavingGoalMutation
              .mutateAsync({ id })
              .then(() => router.replace('/saving-goals'))
              .catch(() =>
                showAlert({
                  title: 'Couldn’t delete goal',
                  message: 'Please try again.',
                }),
              );
          },
        },
      ],
    });
  }

  if (
    !isLoading &&
    isError &&
    !(error instanceof ApiError && error.status === 404)
  ) {
    return (
      <AppScreen headerTitle="Goal details">
        <View style={[styles.message, { padding: spacing.lg }]}>
          <Text
            style={{
              color: colors.text.primary,
              fontSize: typography.sizes.lg,
              fontWeight: '700',
            }}
          >
            Couldn’t load goal
          </Text>
          <Text style={{ color: colors.text.secondary }}>
            Check your connection and try again.
          </Text>
          <Button onClick={() => void refetch()} variant="outline">
            Try again
          </Button>
        </View>
      </AppScreen>
    );
  }
  if (!isLoading && !goal) {
    return (
      <AppScreen headerTitle="Goal details">
        <View style={[styles.message, { padding: spacing.lg }]}>
          <Text
            style={{
              color: colors.text.primary,
              fontSize: typography.sizes.lg,
              fontWeight: '700',
            }}
          >
            Goal not found
          </Text>
          <Text style={{ color: colors.text.secondary }}>
            This goal may have been deleted.
          </Text>
          <Button onClick={() => router.back()} variant="outline">
            Go back
          </Button>
        </View>
      </AppScreen>
    );
  }

  const progress = goal ? goalProgress(goal) : 0;
  const names = goal
    ? accounts
        .filter((account) => goal.accounts.includes(account.id))
        .map((account) => account.name)
        .join(', ')
    : '';
  const status = goal ? goalStatus(goal) : null;
  return (
    <AppScreen
      headerTitle="Goal details"
      isLoading={isLoading}
      loadingMessage="Loading goal…"
      headerOptions={{
        headerRight: () =>
          goal ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Edit goal"
              onPress={() => router.push(`/saving-goals/${id}/edit`)}
            >
              <Text style={{ color: colors.accent.primary, fontWeight: '600' }}>
                Edit
              </Text>
            </Pressable>
          ) : null,
      }}
    >
      {goal && (
        <ScrollView
          contentContainerStyle={{ padding: spacing.md, gap: spacing.md }}
        >
          <View style={{ gap: spacing.xs }}>
            <Text
              accessibilityRole="header"
              style={{
                color: colors.text.primary,
                fontSize: typography.sizes.xxl,
                fontWeight: '700',
              }}
            >
              {goal.name}
            </Text>
            {goal.description && (
              <Text style={{ color: colors.text.secondary }}>
                {goal.description}
              </Text>
            )}
          </View>
          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.surface.background.primary,
                borderColor: colors.surface.border.primary,
                borderRadius: borderRadius.lg,
                padding: spacing.lg,
                gap: spacing.sm,
              },
            ]}
          >
            {status && (
              <Text
                style={{
                  color: goal.isOverdue
                    ? colors.status.error
                    : colors.status.success,
                  fontWeight: '600',
                }}
              >
                {status}
              </Text>
            )}
            <Text
              style={[
                styles.amount,
                {
                  color:
                    goal.currentAmount < 0
                      ? colors.status.error
                      : colors.support.primary,
                  fontSize: typography.sizes.xxl,
                },
              ]}
            >
              {formatGoalAmount(goal.currentAmount, goal.currency)}
            </Text>
            <Text style={{ color: colors.text.secondary }}>
              saved towards {formatGoalAmount(goal.targetAmount, goal.currency)}
            </Text>
            <View
              accessible
              accessibilityRole="progressbar"
              accessibilityLabel={`${goal.name} progress`}
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
                    backgroundColor: goal.isCompleted
                      ? colors.status.success
                      : colors.accent.primary,
                    width: `${progress}%`,
                  },
                ]}
              />
            </View>
            <View style={styles.between}>
              <Text style={{ color: colors.accent.primary, fontWeight: '700' }}>
                {Math.round(progress)}% complete
              </Text>
              <Text style={{ color: colors.text.secondary }}>
                {formatGoalAmount(goal.remainingAmount, goal.currency)}{' '}
                remaining
              </Text>
            </View>
          </View>
          <Text style={{ color: colors.text.secondary, fontWeight: '700' }}>
            GOAL DETAILS
          </Text>
          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.surface.background.primary,
                borderColor: colors.surface.border.primary,
                borderRadius: borderRadius.lg,
              },
            ]}
          >
            <DetailRow
              label="Target amount"
              value={formatGoalAmount(goal.targetAmount, goal.currency)}
            />
            <DetailRow
              label="Current amount"
              value={formatGoalAmount(goal.currentAmount, goal.currency)}
            />
            <DetailRow
              label="Target date"
              value={
                goal.targetDate
                  ? formatPreferenceDate(goal.targetDate, dateFormat)
                  : 'No deadline'
              }
            />
            <DetailRow
              label="Linked accounts"
              value={
                names ||
                `${goal.accounts.length} linked account${goal.accounts.length === 1 ? '' : 's'}`
              }
              last
            />
          </View>
          <Button
            onClick={() => router.push(`/saving-goals/${id}/edit`)}
            variant="outline"
          >
            Edit goal
          </Button>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Delete goal"
            accessibilityState={{
              disabled: deleteSavingGoalMutation.isPending,
            }}
            disabled={deleteSavingGoalMutation.isPending}
            onPress={confirmDelete}
            style={[styles.delete, { minHeight: 48 }]}
          >
            <Text style={{ color: colors.status.error, fontWeight: '600' }}>
              Delete goal
            </Text>
          </Pressable>
        </ScrollView>
      )}
    </AppScreen>
  );
}

function DetailRow({
  label,
  value,
  last = false,
}: Readonly<{ label: string; value: string; last?: boolean }>) {
  const { colors, spacing } = useTheme();
  return (
    <View
      style={[
        styles.detailRow,
        {
          borderBottomWidth: last ? 0 : StyleSheet.hairlineWidth,
          borderBottomColor: colors.surface.border.primary,
          padding: spacing.md,
        },
      ]}
    >
      <Text style={{ color: colors.text.secondary, flex: 1 }}>{label}</Text>
      <Text
        style={{
          color: colors.text.primary,
          flex: 1,
          fontWeight: '600',
          textAlign: 'right',
          fontVariant: ['tabular-nums'],
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
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  amount: { fontWeight: '700', fontVariant: ['tabular-nums'] },
  track: { height: 10, borderRadius: 5, overflow: 'hidden' },
  fill: { height: 10, borderRadius: 5 },
  between: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  detailRow: { flexDirection: 'row', alignItems: 'center' },
  delete: { alignItems: 'center', justifyContent: 'center' },
  message: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
});
