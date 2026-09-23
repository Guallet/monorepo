import { useMemo, useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
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
  useBudget,
  useBudgetMutations,
  useBudgetTransactions,
  useCategories,
} from '@guallet/api-react';
import { useTheme } from '@guallet/luna-mobile';
import { AppScreen } from '@/components/layout/AppScreen';
import { BudgetCard } from '../components/BudgetCard';
import { BudgetMonthSelector } from '../components/BudgetMonthSelector';
import { BudgetTransactionRow } from '../components/BudgetTransactionRow';
import { getBudgetMonth, getMonthStart } from '../models';

export default function BudgetDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors, spacing, typography } = useTheme();
  const [selectedDate, setSelectedDate] = useState(() =>
    getMonthStart(new Date()),
  );
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
  } = useBudgetTransactions({
    args: { month, year },
    budgetId: id,
  });
  const { categories } = useCategories();
  const { deleteBudgetMutation } = useBudgetMutations();

  const categoryNames = useMemo(
    () => new Map(categories.map((category) => [category.id, category.name])),
    [categories],
  );

  function confirmDelete() {
    Alert.alert(
      'Delete budget?',
      'This removes the budget but does not delete its transactions.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            void deleteBudgetMutation.mutateAsync(id).then(
              () => router.replace('/budgets'),
              () =>
                Alert.alert(
                  'Couldn’t delete budget',
                  'Please try again in a moment.',
                ),
            );
          },
        },
      ],
    );
  }

  let transactionContent: ReactNode;
  if (isTransactionsLoading) {
    transactionContent = (
      <View style={styles.transactionLoading}>
        <ActivityIndicator color={colors.accent.primary} />
      </View>
    );
  } else if (isTransactionsError) {
    transactionContent = (
      <View style={{ paddingVertical: spacing.lg }}>
        <Text
          style={{
            color: colors.text.secondary,
            fontSize: typography.sizes.sm,
          }}
        >
          Couldn’t load transactions for this month.
        </Text>
        <Pressable
          onPress={() => void refetchTransactions()}
          style={{ marginTop: spacing.sm }}
        >
          <Text
            style={{
              color: colors.accent.primary,
              fontSize: typography.sizes.sm,
              fontWeight: '600',
            }}
          >
            Try again
          </Text>
        </Pressable>
      </View>
    );
  } else if (transactions.length === 0) {
    transactionContent = (
      <Text
        style={{
          color: colors.text.secondary,
          fontSize: typography.sizes.sm,
          paddingVertical: spacing.lg,
        }}
      >
        No transactions found for this month.
      </Text>
    );
  } else {
    transactionContent = transactions.map((transaction) => {
      let categoryName: string | undefined;
      if (transaction.categoryId) {
        categoryName = categoryNames.get(transaction.categoryId);
      }
      return (
        <BudgetTransactionRow
          key={transaction.id}
          categoryName={categoryName}
          transaction={transaction}
        />
      );
    });
  }

  if (isLoading) {
    return (
      <AppScreen headerTitle="Budget">
        <View style={styles.centered}>
          <ActivityIndicator color={colors.accent.primary} />
        </View>
      </AppScreen>
    );
  }

  if (isError || !budget) {
    return (
      <AppScreen headerTitle="Budget">
        <View style={[styles.centered, { padding: spacing.lg }]}>
          <Text
            style={{
              color: colors.text.primary,
              fontSize: typography.sizes.lg,
              fontWeight: '700',
            }}
          >
            Couldn’t load this budget
          </Text>
          <Text
            style={{
              color: colors.text.secondary,
              fontSize: typography.sizes.sm,
              marginTop: spacing.xs,
            }}
          >
            The budget may have been deleted or is temporarily unavailable.
          </Text>
          <Pressable
            onPress={() => void refetch()}
            style={{ marginTop: spacing.md }}
          >
            <Text
              style={{
                color: colors.accent.primary,
                fontSize: typography.sizes.sm,
                fontWeight: '600',
              }}
            >
              Try again
            </Text>
          </Pressable>
        </View>
      </AppScreen>
    );
  }

  return (
    <AppScreen
      headerTitle={budget.name}
      headerOptions={{
        headerRight: () => (
          <View style={styles.headerActions}>
            <Pressable
              accessibilityLabel="Edit budget"
              accessibilityRole="button"
              disabled={deleteBudgetMutation.isPending}
              onPress={() => router.push(`/budgets/${id}/edit`)}
              style={styles.headerButton}
            >
              <Text
                style={{
                  color: colors.accent.primary,
                  fontSize: typography.sizes.sm,
                }}
              >
                Edit
              </Text>
            </Pressable>
            <Pressable
              accessibilityLabel="Delete budget"
              accessibilityRole="button"
              disabled={deleteBudgetMutation.isPending}
              onPress={confirmDelete}
              style={styles.headerButton}
            >
              <Text
                style={{
                  color: colors.status.error,
                  fontSize: typography.sizes.sm,
                }}
              >
                Delete
              </Text>
            </Pressable>
          </View>
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
        <BudgetMonthSelector date={selectedDate} onChange={setSelectedDate} />
        <BudgetCard budget={budget} />

        <Text
          style={{
            color: colors.text.primary,
            fontSize: typography.sizes.lg,
            fontWeight: '700',
          }}
        >
          Transactions
        </Text>

        <View
          style={[
            styles.transactionCard,
            {
              backgroundColor: colors.surface.background.primary,
              borderColor: colors.surface.border.primary,
              borderRadius: 16,
              paddingHorizontal: spacing.md,
            },
          ]}
        >
          {transactionContent}
        </View>
        <View style={styles.bottomPad} />
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
  },
  centered: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  headerActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    paddingVertical: 6,
  },
  transactionCard: {
    borderWidth: 1,
  },
  transactionLoading: {
    minHeight: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomPad: {
    height: 16,
  },
});
