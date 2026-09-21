import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBudgets } from '@guallet/api-react';
import { Button, useTheme } from '@guallet/luna-mobile';
import { BudgetCard } from '../components/BudgetCard';
import { BudgetMonthSelector } from '../components/BudgetMonthSelector';
import { BudgetSummaryCard } from '../components/BudgetSummaryCard';
import { getBudgetMonth, getBudgetMetrics, getMonthStart } from '../models';

export default function BudgetsScreen() {
  const { borderRadius, colors, spacing, typography } = useTheme();
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(() =>
    getMonthStart(new Date()),
  );
  const { month, year } = getBudgetMonth(selectedDate);
  const { budgets, isError, isLoading, isRefetching, refetch } = useBudgets({
    month,
    year,
  });

  const sortedBudgets = useMemo(
    () =>
      [...budgets].sort((left, right) => {
        const leftMetrics = getBudgetMetrics(left);
        const rightMetrics = getBudgetMetrics(right);
        if (leftMetrics.isOverBudget !== rightMetrics.isOverBudget) {
          return leftMetrics.isOverBudget ? -1 : 1;
        }
        if (leftMetrics.isNearLimit !== rightMetrics.isNearLimit) {
          return leftMetrics.isNearLimit ? -1 : 1;
        }
        return rightMetrics.percent - leftMetrics.percent;
      }),
    [budgets],
  );

  return (
    <SafeAreaView
      edges={['top']}
      style={[
        styles.safeArea,
        { backgroundColor: colors.surface.background.page },
      ]}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { gap: spacing.md, padding: spacing.md },
        ]}
        refreshControl={
          <RefreshControl
            onRefresh={() => void refetch()}
            refreshing={isRefetching}
            tintColor={colors.accent.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Text
              style={{
                color: colors.text.primary,
                fontSize: typography.sizes.xxl,
                fontWeight: '700',
              }}
            >
              Budgets
            </Text>
            <Text
              style={{
                color: colors.text.secondary,
                fontSize: typography.sizes.sm,
              }}
            >
              Plan your monthly spending with confidence.
            </Text>
          </View>
          <Button
            onClick={() => router.push('/budgets/new')}
            style={styles.addButton}
          >
            + New
          </Button>
        </View>

        <BudgetMonthSelector date={selectedDate} onChange={setSelectedDate} />

        {isLoading ? (
          <LoadingState />
        ) : isError ? (
          <MessageCard
            title="Couldn’t load budgets"
            body="Check your connection and try again."
            actionLabel="Try again"
            onAction={() => void refetch()}
          />
        ) : budgets.length === 0 ? (
          <EmptyState onCreate={() => router.push('/budgets/new')} />
        ) : (
          <>
            <BudgetSummaryCard budgets={budgets} />
            <View style={{ gap: spacing.sm }}>
              {sortedBudgets.map((budget) => (
                <BudgetCard
                  key={budget.id}
                  budget={budget}
                  onPress={() => router.push(`/budgets/${budget.id}`)}
                />
              ))}
            </View>
          </>
        )}

        <View style={styles.bottomPad} />
      </ScrollView>
    </SafeAreaView>
  );
}

function LoadingState() {
  const { borderRadius, colors, spacing } = useTheme();

  return (
    <View style={{ gap: spacing.sm }}>
      {[1, 2, 3].map((item) => (
        <View
          key={item}
          style={{
            backgroundColor: colors.surface.background.secondary,
            borderRadius: borderRadius.lg,
            height: item === 1 ? 190 : 130,
          }}
        />
      ))}
      <ActivityIndicator color={colors.accent.primary} style={styles.loader} />
    </View>
  );
}

function EmptyState({ onCreate }: Readonly<{ onCreate: () => void }>) {
  const { borderRadius, colors, spacing, typography } = useTheme();

  return (
    <View
      style={[
        styles.messageCard,
        {
          backgroundColor: colors.surface.background.primary,
          borderColor: colors.surface.border.primary,
          borderRadius: borderRadius.lg,
          padding: spacing.lg,
        },
      ]}
    >
      <Text
        style={{
          color: colors.text.primary,
          fontSize: typography.sizes.lg,
          fontWeight: '700',
        }}
      >
        No budgets yet
      </Text>
      <Text
        style={{
          color: colors.text.secondary,
          fontSize: typography.sizes.sm,
          marginTop: spacing.xs,
        }}
      >
        Create your first budget to start tracking and controlling your
        spending.
      </Text>
      <Button onClick={onCreate} style={{ marginTop: spacing.md }}>
        Create your first budget
      </Button>
    </View>
  );
}

function MessageCard({
  actionLabel,
  body,
  onAction,
  title,
}: Readonly<{
  actionLabel: string;
  body: string;
  onAction: () => void;
  title: string;
}>) {
  const { borderRadius, colors, spacing, typography } = useTheme();

  return (
    <View
      style={[
        styles.messageCard,
        {
          backgroundColor: colors.surface.background.primary,
          borderColor: colors.surface.border.primary,
          borderRadius: borderRadius.lg,
          padding: spacing.lg,
        },
      ]}
    >
      <Text
        style={{
          color: colors.text.primary,
          fontSize: typography.sizes.lg,
          fontWeight: '700',
        }}
      >
        {title}
      </Text>
      <Text
        style={{
          color: colors.text.secondary,
          fontSize: typography.sizes.sm,
          marginTop: spacing.xs,
        }}
      >
        {body}
      </Text>
      <Pressable
        accessibilityRole="button"
        onPress={onAction}
        style={{ marginTop: spacing.md }}
      >
        <Text
          style={{
            color: colors.accent.primary,
            fontSize: typography.sizes.sm,
            fontWeight: '600',
          }}
        >
          {actionLabel}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerCopy: {
    flex: 1,
    gap: 3,
    paddingRight: 8,
  },
  addButton: {
    minWidth: 78,
  },
  messageCard: {
    borderWidth: 1,
  },
  loader: {
    marginTop: -34,
  },
  bottomPad: {
    height: 16,
  },
});
