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
import {
  Card,
  EmptyState,
  Label,
  ProgressBar,
  useTheme,
} from '@luna-ui/react-native';

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
    <Card gap={8}>
      <View style={styles.budgetHeader}>
        <Text style={[styles.budgetName, { color: colors.text }]}>
          {budget.name}
        </Text>
        <Text style={[styles.budgetAmount, { color: colors.text }]}>
          {formatAmount(budget.spent, budget.currency)} /{' '}
          {formatAmount(budget.amount, budget.currency)}
        </Text>
      </View>
      <ProgressBar value={percent} color={progressColor} />
      <View style={styles.budgetFooter}>
        <Label size="sm">
          {percent.toFixed(0)}% used
        </Label>
        <Label size="sm" color={remaining < 0 ? '#EF4444' : undefined}>
          {remaining >= 0 ? 'Remaining: ' : 'Over by: '}
          {formatAmount(Math.abs(remaining), budget.currency)}
        </Label>
      </View>
    </Card>
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
          <EmptyState
            title="No budgets yet"
            message="Create your first budget to start tracking your spending."
          />
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
  listContent: {
    padding: 16,
    gap: 12,
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
  budgetFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
