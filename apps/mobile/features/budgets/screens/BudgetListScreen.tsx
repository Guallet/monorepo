import { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { AppScreen } from '@/components/layout/AppScreen';
import { useBudgets } from '@guallet/api-react';
import { BudgetDto } from '@guallet/api-client';
import { Money } from '@guallet/money';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Label, Title, useTheme } from '@luna-ui/react-native';

function formatAmount(amount: number, currency: string): string {
  try {
    return Money.fromCurrencyCode({ amount, currencyCode: currency }).format();
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}

function getProgressColor(percent: number): string {
  if (percent >= 100) return '#EF4444';
  if (percent >= 80) return '#F59E0B';
  return '#10B981';
}

function BudgetCard({ budget }: { budget: BudgetDto }) {
  const { colors } = useTheme();
  const percent = budget.amount > 0 ? (budget.spent / budget.amount) * 100 : 0;
  const progressColor = getProgressColor(percent);
  const remaining = budget.amount - budget.spent;

  return (
    <View style={styles.budgetCard}>
      <View style={styles.budgetHeader}>
        <Text style={[styles.budgetName, { color: colors.text }]}>
          {budget.name}
        </Text>
        <Text style={[styles.budgetAmount, { color: colors.text }]}>
          {formatAmount(budget.spent, budget.currency)} /{' '}
          {formatAmount(budget.amount, budget.currency)}
        </Text>
      </View>
      <View style={styles.progressBarBackground}>
        <View
          style={[
            styles.progressBarFill,
            {
              width: `${Math.min(percent, 100)}%`,
              backgroundColor: progressColor,
            },
          ]}
        />
      </View>
      <View style={styles.budgetFooter}>
        <Label size="sm">
          {percent.toFixed(0)}% used
        </Label>
        <Label size="sm" color={remaining < 0 ? '#EF4444' : undefined}>
          {remaining >= 0 ? 'Remaining: ' : 'Over by: '}
          {formatAmount(Math.abs(remaining), budget.currency)}
        </Label>
      </View>
    </View>
  );
}

export function BudgetListScreen() {
  const { budgets, isLoading, refetch } = useBudgets();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  return (
    <SafeAreaView style={styles.container}>
      <AppScreen headerTitle="Budgets" isLoading={isLoading && !refreshing}>
        {budgets.length === 0 && !isLoading ? (
          <View style={styles.emptyState}>
            <Title>No budgets yet</Title>
            <Label center>
              Create your first budget to start tracking your spending.
            </Label>
          </View>
        ) : (
          <FlatList
            data={budgets}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <BudgetCard budget={item} />}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        )}
      </AppScreen>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 8,
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  budgetCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  budgetName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  budgetAmount: {
    fontSize: 14,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  budgetFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
