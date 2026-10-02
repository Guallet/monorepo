import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ApiError } from '@guallet/api-client';
import {
  useAccounts,
  useSavingGoal,
  useSavingGoalMutations,
} from '@guallet/api-react';
import { Button, useTheme } from '@guallet/luna-mobile';
import { AppScreen } from '@/components/layout/AppScreen';
import { useMobileUserPreferences } from '@/features/settings/useMobileUserPreferences';
import { formatPreferenceDate } from '@/utils/formatPreferenceDate';
import {
  formatGoalAmount,
  goalProgress,
  goalStatus,
} from '../models/savingGoal';
import { useTranslation } from 'react-i18next';

export default function GoalDetailsScreen() {
  const { t } = useTranslation();
  const { id: rawId } = useLocalSearchParams<{ id: string | string[] }>();
  const id = Array.isArray(rawId) ? (rawId[0] ?? '') : (rawId ?? '');
  const router = useRouter();
  const { colors, spacing, typography, borderRadius } = useTheme();
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
    Alert.alert(
      t('Delete “{{name}}”?', { name: goal.name }),
      t(
        'This goal and its progress will be removed. Linked account balances will stay as they are.',
      ),
      [
        { text: t('Keep goal'), style: 'cancel' },
        {
          text: t('Delete goal'),
          style: 'destructive',
          onPress: () => {
            void deleteSavingGoalMutation
              .mutateAsync({ id })
              .then(() => router.replace('/saving-goals'))
              .catch(() =>
                Alert.alert(t('Couldn’t delete goal'), t('Please try again.')),
              );
          },
        },
      ],
    );
  }

  if (
    !isLoading &&
    isError &&
    !(error instanceof ApiError && error.status === 404)
  ) {
    return (
      <AppScreen headerTitle={t('copy_c89qsg')}>
        <View style={[styles.message, { padding: spacing.lg }]}>
          <Text
            style={{
              color: colors.text.primary,
              fontSize: typography.sizes.lg,
              fontWeight: '700',
            }}
          >
            {t('copy_1hlm9ke')}
          </Text>
          <Text style={{ color: colors.text.secondary }}>
            {t('copy_k8irws')}
          </Text>
          <Button onClick={() => void refetch()} variant="outline">
            {t('copy_982hh6')}
          </Button>
        </View>
      </AppScreen>
    );
  }
  if (!isLoading && !goal) {
    return (
      <AppScreen headerTitle={t('copy_c89qsg')}>
        <View style={[styles.message, { padding: spacing.lg }]}>
          <Text
            style={{
              color: colors.text.primary,
              fontSize: typography.sizes.lg,
              fontWeight: '700',
            }}
          >
            {t('copy_9f54c7')}
          </Text>
          <Text style={{ color: colors.text.secondary }}>
            {t('copy_68ksjq')}
          </Text>
          <Button onClick={() => router.back()} variant="outline">
            {t('copy_rcg61q')}
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
      headerTitle={t('copy_c89qsg')}
      isLoading={isLoading}
      loadingMessage={t('copy_1h4lsio')}
      headerOptions={{
        headerRight: () =>
          goal ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('copy_12urhkc')}
              onPress={() => router.push(`/saving-goals/${id}/edit`)}
            >
              <Text style={{ color: colors.accent.primary, fontWeight: '600' }}>
                {t('copy_1i1lcq9')}
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
              {t('copy_1mvctpc')}
              {formatGoalAmount(goal.targetAmount, goal.currency)}
            </Text>
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
                {Math.round(progress)}
                {t('copy_mhv6dz')}
              </Text>
              <Text style={{ color: colors.text.secondary }}>
                {formatGoalAmount(goal.remainingAmount, goal.currency)}{' '}
                {t('copy_6qrurn')}
              </Text>
            </View>
          </View>
          <Text style={{ color: colors.text.secondary, fontWeight: '700' }}>
            {t('copy_o1xbq8')}
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
              label={t('copy_cr3ef8')}
              value={formatGoalAmount(goal.targetAmount, goal.currency)}
            />
            <DetailRow
              label={t('copy_gud7bm')}
              value={formatGoalAmount(goal.currentAmount, goal.currency)}
            />
            <DetailRow
              label={t('copy_bk3lak')}
              value={
                goal.targetDate
                  ? formatPreferenceDate(goal.targetDate, dateFormat)
                  : 'No deadline'
              }
            />
            <DetailRow
              label={t('copy_19vosec')}
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
            {t('copy_12urhkc')}
          </Button>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('copy_zj8q29')}
            accessibilityState={{
              disabled: deleteSavingGoalMutation.isPending,
            }}
            disabled={deleteSavingGoalMutation.isPending}
            onPress={confirmDelete}
            style={[styles.delete, { minHeight: 48 }]}
          >
            <Text style={{ color: colors.status.error, fontWeight: '600' }}>
              {t('copy_zj8q29')}
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
