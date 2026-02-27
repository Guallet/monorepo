import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { AppScreen } from '@/components/layout/AppScreen';
import { useAccount } from '@guallet/api-react';
import { Money } from '@guallet/money';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Label, Section, useTheme } from '@luna-ui/react-native';

function formatBalance(amount: number, currency: string): string {
  try {
    return Money.fromCurrencyCode({ amount, currencyCode: currency }).format();
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}

interface AccountDetailScreenProps {
  accountId: string;
}

export function AccountDetailScreen({ accountId }: AccountDetailScreenProps) {
  const { account, isLoading, refetch } = useAccount(accountId);
  const { colors } = useTheme();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const balanceColor =
    account && account.balance.amount < 0 ? '#EF4444' : colors.text;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <AppScreen
        headerTitle={account?.name ?? 'Account'}
        isLoading={isLoading && !refreshing}
      >
        {account && (
          <ScrollView
            contentContainerStyle={styles.content}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            <Card style={styles.balanceCard} gap={4}>
              <Label size="sm" color="#6B7280">
                Current Balance
              </Label>
              <Text style={[styles.balance, { color: balanceColor }]}>
                {formatBalance(account.balance.amount, account.currency)}
              </Text>
              <Label size="sm" color="#6B7280">
                {account.currency}
              </Label>
            </Card>

            <Section title="Details">
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Name</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {account.name}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Currency</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {account.currency}
                </Text>
              </View>
              {account.source && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Source</Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>
                    {account.source}
                  </Text>
                </View>
              )}
            </Section>
          </ScrollView>
        )}
      </AppScreen>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  balanceCard: {
    alignItems: 'center',
  },
  balance: {
    fontSize: 32,
    fontWeight: '700',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
    marginLeft: 16,
  },
});
