import { useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { AppScreen } from '@/components/layout/AppScreen';
import { useAccounts, useTransactions } from '@guallet/api-react';
import { AccountDto, TransactionDto } from '@guallet/api-client';
import { Money } from '@guallet/money';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, EmptyState, ListRow, Title, useTheme } from '@luna-ui/react-native';

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
  });
}

function AccountSummaryCard({ account }: { account: AccountDto }) {
  const { colors } = useTheme();
  const balanceColor = account.balance.amount < 0 ? '#EF4444' : colors.text;

  return (
    <Card style={styles.accountCard}>
      <Text style={[styles.accountName, { color: colors.text }]}>
        {account.name}
      </Text>
      <Text style={[styles.accountBalance, { color: balanceColor }]}>
        {formatAmount(account.balance.amount, account.currency)}
      </Text>
    </Card>
  );
}

function RecentTransactionRow({ transaction }: { transaction: TransactionDto }) {
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

export function DashboardScreen() {
  const { accounts, isLoading: accountsLoading, refetch: refetchAccounts } = useAccounts();
  const { transactions, isLoading: transactionsLoading, refetch: refetchTransactions } = useTransactions();
  const [refreshing, setRefreshing] = useState(false);

  const isLoading = accountsLoading || transactionsLoading;

  const recentTransactions = useMemo(() => {
    return (transactions ?? []).slice(0, 5);
  }, [transactions]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchAccounts(), refetchTransactions()]);
    setRefreshing(false);
  }, [refetchAccounts, refetchTransactions]);

  const sections = useMemo(() => {
    const items: Array<{ type: string; data: any }> = [];

    items.push({ type: 'accounts-header', data: null });

    if (accounts.length > 0) {
      items.push({ type: 'accounts', data: accounts });
    }

    items.push({ type: 'transactions-header', data: null });

    for (const t of recentTransactions) {
      items.push({ type: 'transaction', data: t });
    }

    return items;
  }, [accounts, recentTransactions]);

  return (
    <SafeAreaView style={styles.container}>
      <AppScreen headerTitle="Dashboard" isLoading={isLoading && !refreshing}>
        <FlatList
          data={sections}
          keyExtractor={(item, index) =>
            item.type === 'transaction' ? item.data.id : `${item.type}-${index}`
          }
          renderItem={({ item }) => {
            switch (item.type) {
              case 'accounts-header':
                return (
                  <View style={styles.sectionHeader}>
                    <Title order={4}>Accounts</Title>
                  </View>
                );
              case 'accounts':
                return (
                  <FlatList
                    data={item.data as AccountDto[]}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(a: AccountDto) => a.id}
                    contentContainerStyle={styles.accountsList}
                    renderItem={({ item: account }) => (
                      <AccountSummaryCard account={account} />
                    )}
                  />
                );
              case 'transactions-header':
                return (
                  <View style={styles.sectionHeader}>
                    <Title order={4}>Recent Transactions</Title>
                  </View>
                );
              case 'transaction':
                return (
                  <RecentTransactionRow transaction={item.data as TransactionDto} />
                );
              default:
                return null;
            }
          }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            !isLoading ? (
              <EmptyState
                title="Welcome to Guallet"
                message="Add accounts and transactions to get started."
                style={styles.emptyState}
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
  emptyState: {
    marginTop: 48,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  accountsList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  accountCard: {
    width: 160,
    gap: 4,
  },
  accountName: {
    fontSize: 14,
    fontWeight: '500',
  },
  accountBalance: {
    fontSize: 18,
    fontWeight: '700',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
});
