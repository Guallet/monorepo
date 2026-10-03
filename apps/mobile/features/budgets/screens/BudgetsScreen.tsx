import { useMemo, useState, type ReactNode } from 'react';
import {
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
import { BudgetStateCard } from '../components/BudgetStateCard';
import { BudgetSummaryCard } from '../components/BudgetSummaryCard';
import { getBudgetMonth, getBudgetMetrics, getMonthStart } from '../models';

export default function BudgetsScreen() {
  const { colors, spacing, typography } = useTheme();
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(() =>
    getMonthStart(new Date()),
  );
  function selectMonth(date: Date) {
    setSelectedDate(getMonthStart(date));
  }
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
          if (leftMetrics.isOverBudget) return -1;
          return 1;
        }
        if (leftMetrics.isNearLimit !== rightMetrics.isNearLimit) {
          if (leftMetrics.isNearLimit) return -1;
          return 1;
        }
        return rightMetrics.percent - leftMetrics.percent;
      }),
    [budgets],
  );

  let budgetContent: ReactNode;
  if (isLoading) {
    budgetContent = <BudgetLoadingState />;
  } else if (isError) {
    budgetContent = (
      <BudgetStateCard
        actionLabel="Try again"
        body="Check your connection and try again."
        onAction={() => void refetch()}
        title="Couldn’t load budgets"
        variant="error"
      />
    );
  } else if (budgets.length === 0) {
    budgetContent = (
      <BudgetStateCard
        actionLabel="Create your first budget"
        body="Create a monthly budget to track spending against a limit."
        onAction={() => router.push('/budgets/new')}
        title="No budgets yet"
      />
    );
  } else {
    budgetContent = (
      <>
        <BudgetSummaryCard budgets={budgets} />
        <Text
          accessibilityRole="header"
          style={{
            color: colors.text.secondary,
            fontSize: typography.sizes.xs,
            fontWeight: '700',
            letterSpacing: 0.6,
            marginTop: spacing.xs,
          }}
        >
          YOUR BUDGETS
        </Text>
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
    );
  }

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
              accessibilityRole="header"
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
              Plan and monitor your spending.
            </Text>
          </View>
          <Button
            onClick={() => router.push('/budgets/new')}
            style={styles.addButton}
          >
            New budget
          </Button>
        </View>

        <BudgetMonthSelector date={selectedDate} onChange={selectMonth} />
        {budgetContent}
        <View style={styles.bottomPad} />
      </ScrollView>
    </SafeAreaView>
  );
}

function BudgetLoadingState() {
  const { borderRadius, colors, spacing } = useTheme();
  return (
    <View accessibilityLabel="Loading budgets" style={{ gap: spacing.sm }}>
      {[1, 2, 3].map((item) => (
        <View
          key={item}
          style={[
            styles.skeleton,
            {
              backgroundColor: colors.surface.background.secondary,
              borderRadius: borderRadius.lg,
              height: getSkeletonHeight(item),
            },
          ]}
        />
      ))}
    </View>
  );
}

function getSkeletonHeight(item: number): number {
  if (item === 1) return 164;
  return 124;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: { flexGrow: 1 },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerCopy: { flex: 1, gap: 3, paddingRight: 8 },
  addButton: { minWidth: 110 },
  skeleton: { opacity: 0.7 },
  bottomPad: { height: 16 },
});
