import { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { AppScreen } from '@/components/layout/AppScreen';
import { useBudget, useBudgetTransactions } from '@guallet/api-react';
import { TransactionDto } from '@guallet/api-client';
import { Money } from '@guallet/money';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Card,
  EmptyState,
  Label,
  ListRow,
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

function formatDate(date: Date): string {
  const d = new Date(date);
  return d.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function getProgressColor(percent: number): string {
  if (percent >= 100) return '#EF4444';
  if (percent >= 80) return '#F59E0B';
  return '#10B981';
}

function TransactionRow({ transaction }: { transaction: TransactionDto }) {
  const amountColor = transaction.amount < 0 ? '#EF4444' : '#10B981';

  return (
    <ListRow
      title={transaction.description}
      subtitle={formatDate(transaction.date)}
      right={
        <Text style={[styles.transactionAmount, { color: amountColor }]}>
          {formatAmount(transaction.amount, transaction.currency)}
        </Text>
      }
    />
  );
}

interface BudgetDetailScreenProps {
  budgetId: string;
}

export function BudgetDetailScreen({ budgetId }: BudgetDetailScreenProps) {
  const { budget, isLoading } = useBudget(budgetId);
  const now = new Date();
  const { transactions, isLoading: transactionsLoading, refetch } =
    useBudgetTransactions({
      budgetId,
      args: { month: now.getMonth() + 1, year: now.getFullYear() },
    });
  const { colors } = useTheme();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const percent =
    budget && budget.amount > 0
      ? (budget.spent / budget.amount) * 100
      : 0;
  const remaining = budget ? budget.amount - budget.spent : 0;
  const progressColor = getProgressColor(percent);

  const sections = [];

  if (budget) {
    sections.push({ type: 'header', data: budget });
  }

  if (transactions && transactions.length > 0) {
    sections.push({ type: 'transactions-header', data: null });
    for (const t of transactions) {
      sections.push({ type: 'transaction', data: t });
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <AppScreen
        headerTitle={budget?.name ?? 'Budget'}
        isLoading={isLoading && !refreshing}
      >
        <FlatList
          data={sections}
          keyExtractor={(item, index) =>
            item.type === 'transaction'
              ? (item.data as TransactionDto).id
              : `${item.type}-${index}`
          }
          renderItem={({ item }) => {
            switch (item.type) {
              case 'header':
                return (
                  <Card style={styles.headerCard} gap={12}>
                    <View style={styles.amountRow}>
                      <View style={styles.amountColumn}>
                        <Label size="sm" color="#6B7280">
                          Spent
                        </Label>
                        <Text
                          style={[styles.amountValue, { color: colors.text }]}
                        >
                          {budget
                            ? formatAmount(budget.spent, budget.currency)
                            : ''}
                        </Text>
                      </View>
                      <View style={styles.amountColumn}>
                        <Label size="sm" color="#6B7280">
                          Budget
                        </Label>
                        <Text
                          style={[styles.amountValue, { color: colors.text }]}
                        >
                          {budget
                            ? formatAmount(budget.amount, budget.currency)
                            : ''}
                        </Text>
                      </View>
                    </View>
                    <ProgressBar value={percent} color={progressColor} />
                    <View style={styles.amountRow}>
                      <Label size="sm">{percent.toFixed(0)}% used</Label>
                      <Label
                        size="sm"
                        color={remaining < 0 ? '#EF4444' : '#10B981'}
                      >
                        {remaining >= 0 ? 'Remaining: ' : 'Over by: '}
                        {budget
                          ? formatAmount(
                              Math.abs(remaining),
                              budget.currency,
                            )
                          : ''}
                      </Label>
                    </View>
                  </Card>
                );
              case 'transactions-header':
                return (
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Transactions</Text>
                  </View>
                );
              case 'transaction':
                return (
                  <TransactionRow
                    transaction={item.data as TransactionDto}
                  />
                );
              default:
                return null;
            }
          }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            !isLoading && !transactionsLoading ? (
              <EmptyState
                title={budget ? 'No spending yet' : 'Budget not found'}
                message={
                  budget
                    ? 'Transactions matching this budget will appear here.'
                    : 'This budget could not be loaded.'
                }
              />
            ) : null
          }
        />
      </AppScreen>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerCard: {
    margin: 16,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amountColumn: {
    alignItems: 'center',
    gap: 2,
  },
  amountValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
});
