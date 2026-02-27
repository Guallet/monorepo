import { useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
} from 'react-native';
import { AppScreen } from '@/components/layout/AppScreen';
import { useCashflowReports } from '@guallet/api-react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Card,
  EmptyState,
  Label,
  Section,
  useTheme,
} from '@luna-ui/react-native';
import { Money } from '@guallet/money';

function formatAmount(value: string): string {
  try {
    const num = parseFloat(value);
    return Money.fromCurrencyCode({ amount: num, currencyCode: 'GBP' }).format();
  } catch {
    return value;
  }
}

export function CashflowReportScreen() {
  const currentYear = new Date().getFullYear();
  const { cashflowData, isLoading } = useCashflowReports({
    year: currentYear,
  });
  const { colors, spacing } = useTheme();

  const categoryRows = useMemo(() => {
    if (!cashflowData?.data) return [];
    return cashflowData.data;
  }, [cashflowData]);

  return (
    <SafeAreaView style={styles.container}>
      <AppScreen headerTitle="Cashflow Report" isLoading={isLoading}>
        {!cashflowData && !isLoading ? (
          <EmptyState
            title="No data available"
            message="Cashflow data will appear here once you have transactions."
          />
        ) : (
          <FlatList
            data={categoryRows}
            keyExtractor={(item, index) =>
              item.categoryId ?? `row-${index}`
            }
            ListHeaderComponent={
              cashflowData ? (
                <View style={{ padding: spacing.md }}>
                  <Card style={styles.summaryCard}>
                    <Label size="sm" color="#6B7280">
                      Year {cashflowData.year}
                    </Label>
                    <Text style={[styles.summaryValue, { color: colors.text }]}>
                      {cashflowData.totalTransactions} transactions
                    </Text>
                  </Card>
                </View>
              ) : null
            }
            renderItem={({ item }) => {
              const total = item.values.reduce(
                (sum, v) => sum + parseFloat(v || '0'),
                0,
              );
              const isNegative = total < 0;
              return (
                <View style={styles.row}>
                  <View style={styles.rowContent}>
                    <Text
                      style={[styles.categoryName, { color: colors.text }]}
                      numberOfLines={1}
                    >
                      {item.categoryName}
                    </Text>
                    <Text style={styles.transactionCount}>
                      {item.totalTransactions} txns
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.totalAmount,
                      { color: isNegative ? '#EF4444' : '#10B981' },
                    ]}
                  >
                    {formatAmount(total.toFixed(2))}
                  </Text>
                </View>
              );
            }}
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
  summaryCard: {
    alignItems: 'center',
    gap: 4,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: 'white',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  rowContent: {
    flex: 1,
    gap: 2,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '500',
  },
  transactionCount: {
    fontSize: 13,
    color: '#6B7280',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
});
