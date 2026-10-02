import { useMemo, useState, type ReactNode } from 'react';
import {
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  useAccounts,
  useBudget,
  useBudgetMutations,
  useBudgetTransactions,
  useCategories,
} from '@guallet/api-react';
import { useTheme } from '@guallet/luna-mobile';
import { AppScreen } from '@/components/layout/AppScreen';
import { useBudgetMonth } from '../BudgetMonthContext';
import { BudgetMonthSelector } from '../components/BudgetMonthSelector';
import { BudgetProgressCard } from '../components/BudgetProgressCard';
import { BudgetStateCard } from '../components/BudgetStateCard';
import { BudgetTransactionRow } from '../components/BudgetTransactionRow';
import { getBudgetMonth } from '../models';

export default function BudgetDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { borderRadius, colors, spacing, typography } = useTheme();
  const { selectedDate, selectMonth } = useBudgetMonth();
  const { month, year } = getBudgetMonth(selectedDate);
  const { budget, isError, isLoading, isRefetching, refetch } = useBudget(id, {
    month,
    year,
  });
  const {
    isRefetching: isTransactionsRefetching,
    isError: isTransactionsError,
    isLoading: isTransactionsLoading,
    refetch: refetchTransactions,
    transactions,
  } = useBudgetTransactions({ args: { month, year }, budgetId: id });
  const { categories } = useCategories();
  const { accounts } = useAccounts();
  const { deleteBudgetMutation } = useBudgetMutations();
  const [deleteError, setDeleteError] = useState(false);

  const categoryMap = useMemo(
    () => new Map(categories.map((category) => [category.id, category])),
    [categories],
  );
  const accountNames = useMemo(
    () => new Map(accounts.map((account) => [account.id, account.name])),
    [accounts],
  );
  const budgetCategoryNames = useMemo(
    () =>
      budget?.categories
        .map((categoryId) => categoryMap.get(categoryId)?.name)
        .filter((name): name is string => Boolean(name)) ?? [],
    [budget?.categories, categoryMap],
  );

  function confirmDelete() {
    if (!budget) return;
    Alert.alert(
      `Delete “${budget.name}”?`,
      'This budget and its progress will be removed. Its transactions will stay in your account.',
      [
        { text: 'Keep budget', style: 'cancel' },
        {
          text: 'Delete budget',
          style: 'destructive',
          onPress: () => {
            setDeleteError(false);
            void deleteBudgetMutation.mutateAsync(id).then(
              () => router.replace('/budgets'),
              () => setDeleteError(true),
            );
          },
        },
      ],
    );
  }

  let transactionContent: ReactNode;
  if (isTransactionsLoading) {
    transactionContent = (
      <View
        accessibilityLabel="Loading transactions"
        style={styles.transactionLoading}
      >
        {[1, 2, 3].map((item) => (
          <View
            key={item}
            style={{
              backgroundColor: colors.surface.background.secondary,
              borderRadius: borderRadius.md,
              height: 42,
              marginVertical: spacing.xs,
            }}
          />
        ))}
      </View>
    );
  } else if (isTransactionsError) {
    transactionContent = (
      <BudgetStateCard
        actionLabel="Try again"
        body="Budget progress is still available. Try loading the transactions again."
        onAction={() => void refetchTransactions()}
        title="Couldn’t load transactions"
        variant="error"
      />
    );
  } else if (transactions.length === 0) {
    transactionContent = (
      <BudgetStateCard
        body="Transactions in the selected categories will appear here."
        title="No transactions yet"
      />
    );
  } else {
    transactionContent = (
      <View
        style={[
          styles.transactionCard,
          {
            backgroundColor: colors.surface.background.primary,
            borderColor: colors.surface.border.primary,
            borderRadius: borderRadius.lg,
            paddingHorizontal: spacing.md,
          },
        ]}
      >
        {transactions.map((transaction) => {
          let category;
          if (transaction.categoryId) {
            category = categoryMap.get(transaction.categoryId);
          }
          return (
            <BudgetTransactionRow
              key={transaction.id}
              accountName={accountNames.get(transaction.accountId)}
              category={category}
              onPress={() => router.push(`/transactions/${transaction.id}`)}
              transaction={transaction}
            />
          );
        })}
      </View>
    );
  }

  if (isLoading) {
    return (
      <AppScreen headerTitle="Budget">
        <View
          accessibilityLabel="Loading budget"
          style={[
            styles.loadingCard,
            {
              backgroundColor: colors.surface.background.secondary,
              borderRadius: borderRadius.lg,
              margin: spacing.md,
            },
          ]}
        />
      </AppScreen>
    );
  }

  if (isError || !budget) {
    return (
      <AppScreen headerTitle="Budget">
        <View style={{ padding: spacing.md }}>
          <BudgetMonthSelector date={selectedDate} onChange={selectMonth} />
          <View style={{ marginTop: spacing.lg }}>
            <BudgetStateCard
              actionLabel="Try again"
              body="The budget may have been deleted or is temporarily unavailable."
              onAction={() => void refetch()}
              title="Couldn’t load this budget"
              variant="error"
            />
          </View>
        </View>
      </AppScreen>
    );
  }

  let deleteLabel = 'Delete budget';
  if (deleteBudgetMutation.isPending) deleteLabel = 'Deleting…';

  return (
    <AppScreen
      headerTitle={budget.name}
      headerOptions={{
        headerRight: () => (
          <Pressable
            accessibilityLabel={`Edit ${budget.name} budget`}
            accessibilityRole="button"
            disabled={deleteBudgetMutation.isPending}
            onPress={() => router.push(`/budgets/${id}/edit`)}
            style={styles.editButton}
          >
            <Text
              style={{
                color: colors.accent.primary,
                fontSize: typography.sizes.sm,
                fontWeight: '600',
              }}
            >
              Edit
            </Text>
          </Pressable>
        ),
      }}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { gap: spacing.md, padding: spacing.md },
        ]}
        refreshControl={
          <RefreshControl
            onRefresh={() => {
              void refetch();
              void refetchTransactions();
            }}
            refreshing={isRefetching || isTransactionsRefetching}
            tintColor={colors.accent.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {deleteError && (
          <Text
            accessibilityRole="alert"
            style={{
              backgroundColor: colors.surface.background.secondary,
              color: colors.status.error,
              fontSize: typography.sizes.sm,
              padding: spacing.sm,
            }}
          >
            Couldn’t delete “{budget.name}”. Please try again.
          </Text>
        )}
        <BudgetMonthSelector date={selectedDate} onChange={selectMonth} />
        <BudgetProgressCard
          budget={budget}
          categoryNames={budgetCategoryNames}
        />
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
          TRANSACTIONS THIS MONTH
        </Text>
        {transactionContent}
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
          MANAGE
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Delete ${budget.name} budget`}
          accessibilityState={{ disabled: deleteBudgetMutation.isPending }}
          disabled={deleteBudgetMutation.isPending}
          onPress={confirmDelete}
          style={[
            styles.deleteRow,
            {
              backgroundColor: colors.surface.background.primary,
              borderColor: colors.surface.border.primary,
              borderRadius: borderRadius.lg,
              padding: spacing.md,
            },
          ]}
        >
          <Text
            style={{
              color: colors.status.error,
              fontSize: typography.sizes.sm,
              fontWeight: '600',
            }}
          >
            {deleteLabel}
          </Text>
        </Pressable>
        <View style={styles.bottomPad} />
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1 },
  editButton: { justifyContent: 'center', minHeight: 44, paddingHorizontal: 8 },
  transactionCard: { borderWidth: 1, elevation: 1 },
  transactionLoading: { minHeight: 170 },
  loadingCard: { height: 260 },
  deleteRow: { borderWidth: 1, minHeight: 56, justifyContent: 'center' },
  bottomPad: { height: 16 },
});
