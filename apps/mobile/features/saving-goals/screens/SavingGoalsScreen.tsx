import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAccounts, useSavingGoals } from '@guallet/api-react';
import { Button, useTheme } from '@guallet/luna-mobile';
import { SavingsIcon } from '@guallet/luna-mobile/icons';
import { AppScreen } from '@/components/layout/AppScreen';
import { GoalCard } from '../components/GoalCard';
import { useMobileUserPreferences } from '@/features/settings/useMobileUserPreferences';
import { formatPreferenceDate } from '@/utils/formatPreferenceDate';

export default function SavingGoalsScreen() {
  const router = useRouter();
  const { colors, spacing, typography, borderRadius } = useTheme();
  const { dateFormat } = useMobileUserPreferences();
  const { savingGoals, isLoading, isError, isRefetching, refetch } =
    useSavingGoals();
  const { accounts } = useAccounts();

  return (
    <AppScreen headerTitle="Saving goals">
      <ScrollView
        contentContainerStyle={{ padding: spacing.md, gap: spacing.md }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => void refetch()}
            tintColor={colors.accent.primary}
          />
        }
      >
        <View style={styles.heading}>
          <View style={styles.headingText}>
            <Text
              accessibilityRole="header"
              style={{
                color: colors.text.primary,
                fontSize: typography.sizes.xxl,
                fontWeight: '700',
              }}
            >
              Saving goals
            </Text>
            <Text style={{ color: colors.text.secondary }}>
              Track what you are saving towards.
            </Text>
          </View>
          <Button onClick={() => router.push('/saving-goals/new')}>Add</Button>
        </View>
        {isLoading &&
          [0, 1].map((index) => (
            <View
              key={index}
              accessibilityLabel="Loading saving goals"
              style={[
                styles.skeleton,
                {
                  backgroundColor: colors.surface.background.secondary,
                  borderRadius: borderRadius.lg,
                },
              ]}
            />
          ))}
        {!isLoading && isError && (
          <View
            style={[
              styles.message,
              {
                backgroundColor: colors.surface.background.primary,
                borderColor: colors.surface.border.primary,
                borderRadius: borderRadius.lg,
                padding: spacing.lg,
              },
            ]}
          >
            <Text style={[styles.messageTitle, { color: colors.text.primary }]}>
              Couldn’t load goals
            </Text>
            <Text style={{ color: colors.text.secondary }}>
              Check your connection and try again.
            </Text>
            <Button onClick={() => void refetch()} variant="outline">
              Try again
            </Button>
          </View>
        )}
        {!isLoading && !isError && savingGoals.length === 0 && (
          <View
            style={[
              styles.message,
              styles.empty,
              {
                backgroundColor: colors.surface.background.primary,
                borderColor: colors.surface.border.primary,
                borderRadius: borderRadius.lg,
                padding: spacing.lg,
              },
            ]}
          >
            <SavingsIcon size={48} color={colors.text.secondary} />
            <Text style={[styles.messageTitle, { color: colors.text.primary }]}>
              No saving goals yet
            </Text>
            <Text style={{ color: colors.text.secondary, textAlign: 'center' }}>
              Create a goal, choose a target, and link an account to track
              progress.
            </Text>
            <Button onClick={() => router.push('/saving-goals/new')}>
              Create your first goal
            </Button>
          </View>
        )}
        {!isLoading &&
          !isError &&
          savingGoals.map((goal) => {
            const names = accounts
              .filter((account) => goal.accounts.includes(account.id))
              .map((account) => account.name)
              .join(', ');
            const deadline = goal.targetDate
              ? ` · ${formatPreferenceDate(goal.targetDate, dateFormat)}`
              : '';
            return (
              <GoalCard
                key={goal.id}
                goal={goal}
                accountNames={`${names || `${goal.accounts.length} linked account${goal.accounts.length === 1 ? '' : 's'}`}${deadline}`}
                onPress={() => router.push(`/saving-goals/${goal.id}`)}
              />
            );
          })}
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  heading: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  headingText: { flex: 1, gap: 3 },
  skeleton: { height: 125 },
  message: { borderWidth: 1, gap: 12 },
  empty: {
    alignItems: 'center',
    borderStyle: 'dashed',
    borderWidth: 2,
    marginTop: 20,
  },
  messageTitle: { fontSize: 20, fontWeight: '700' },
});
