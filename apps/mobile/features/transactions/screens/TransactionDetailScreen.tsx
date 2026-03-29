import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { AppScreen } from '@/components/layout/AppScreen';
import { useTransaction } from '@guallet/api-react';
import { Money } from '@guallet/money';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, EmptyState, Label, Section, useTheme } from '@luna-ui/react-native';

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
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

interface TransactionDetailScreenProps {
  transactionId: string;
}

export function TransactionDetailScreen({
  transactionId,
}: TransactionDetailScreenProps) {
  const { transaction, isLoading } = useTransaction(transactionId);
  const { colors } = useTheme();

  const amountColor =
    transaction && transaction.amount < 0 ? '#EF4444' : '#10B981';

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <AppScreen headerTitle="Transaction" isLoading={isLoading}>
        {!transaction && !isLoading && (
          <EmptyState
            title="Transaction not found"
            message="This transaction could not be loaded."
          />
        )}
        {transaction && (
          <ScrollView contentContainerStyle={styles.content}>
            <Card style={styles.amountCard} gap={8}>
              <Text style={[styles.amount, { color: amountColor }]}>
                {formatAmount(transaction.amount, transaction.currency)}
              </Text>
              <Label size="sm" color="#6B7280">
                {formatDate(transaction.date)}
              </Label>
            </Card>

            <Section title="Details">
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Description</Text>
                <Text
                  style={[styles.detailValue, { color: colors.text }]}
                  numberOfLines={2}
                >
                  {transaction.description}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Currency</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {transaction.currency}
                </Text>
              </View>
              {transaction.notes && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Notes</Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>
                    {transaction.notes}
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
  amountCard: {
    alignItems: 'center',
  },
  amount: {
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
