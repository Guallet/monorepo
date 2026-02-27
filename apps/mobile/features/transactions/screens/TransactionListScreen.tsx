import { useState, useCallback } from 'react';
import {
  View,
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
import { Label, Title, useTheme } from '@luna-ui/react-native';

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
  const { colors } = useTheme();
  const amountColor = transaction.amount < 0 ? '#EF4444' : '#10B981';

  return (
    <View style={styles.transactionRow}>
      <View style={styles.transactionInfo}>
        <Text
          style={[styles.transactionDescription, { color: colors.text }]}
          numberOfLines={1}
        >
          {transaction.description}
        </Text>
        <Label size="sm">{formatDate(transaction.date)}</Label>
      </View>
      <Text style={[styles.transactionAmount, { color: amountColor }]}>
        {formatAmount(transaction.amount, transaction.currency)}
      </Text>
    </View>
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
          <View style={styles.emptyState}>
            <Title>No transactions yet</Title>
            <Label center>
              Your transactions will appear here once you start adding them.
            </Label>
          </View>
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
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 8,
  },
  transactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  transactionInfo: {
    flex: 1,
    gap: 2,
    marginRight: 12,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '500',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
});
