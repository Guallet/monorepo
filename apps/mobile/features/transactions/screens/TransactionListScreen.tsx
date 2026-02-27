import { useState, useCallback } from 'react';
import {
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { AppScreen } from '@/components/layout/AppScreen';
import { useTransactions } from '@guallet/api-react';
import { TransactionDto } from '@guallet/api-client';
import { Money } from '@guallet/money';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState, ListRow, useTheme } from '@luna-ui/react-native';

function formatDate(date: Date): string {
  const d = new Date(date);
  return d.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatAmount(amount: number, currency: string): string {
  try {
    return Money.fromCurrencyCode({ amount, currencyCode: currency }).format();
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}

function TransactionRow({
  transaction,
}: {
  transaction: TransactionDto;
}) {
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

export function TransactionListScreen() {
  const { transactions, isLoading, refetch } = useTransactions();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  return (
    <SafeAreaView style={styles.container}>
      <AppScreen headerTitle="Transactions" isLoading={isLoading && !refreshing}>
        {transactions.length === 0 && !isLoading ? (
          <EmptyState
            title="No transactions yet"
            message="Your transactions will appear here once you start adding them."
          />
        ) : (
          <FlatList
            data={transactions}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <TransactionRow transaction={item} />}
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
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
});
