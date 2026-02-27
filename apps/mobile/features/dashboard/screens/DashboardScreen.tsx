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
import { Label, Title, useTheme } from '@luna-ui/react-native';

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
    <View style={styles.accountCard}>
      <Text style={[styles.accountName, { color: colors.text }]}>
        {account.name}
      </Text>
      <Text style={[styles.accountBalance, { color: balanceColor }]}>
        {formatAmount(account.balance.amount, account.currency)}
      </Text>
    </View>
  );
}

function RecentTransactionRow({ transaction }: { transaction: TransactionDto }) {
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
              <View style={styles.emptyState}>
                <Title>Welcome to Guallet</Title>
                <Label center>
                  Add accounts and transactions to get started.
                </Label>
              </View>
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
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 8,
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
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    width: 160,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
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
