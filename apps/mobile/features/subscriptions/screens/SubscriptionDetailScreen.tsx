import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { AppScreen } from '@/components/layout/AppScreen';
import { useSubscription } from '@guallet/api-react';
import { RecurrenceCadence, RecurringPaymentType } from '@guallet/api-client';
import { Money } from '@guallet/money';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Label, Section, useTheme } from '@luna-ui/react-native';

function formatAmount(amount: number, currency: string): string {
  try {
    return Money.fromCurrencyCode({ amount, currencyCode: currency }).format();
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}

function getCadenceLabel(cadence: RecurrenceCadence): string {
  switch (cadence) {
    case RecurrenceCadence.WEEKLY:
      return 'Weekly';
    case RecurrenceCadence.BIWEEKLY:
      return 'Bi-weekly';
    case RecurrenceCadence.MONTHLY:
      return 'Monthly';
    case RecurrenceCadence.QUARTERLY:
      return 'Quarterly';
    case RecurrenceCadence.YEARLY:
      return 'Yearly';
    default:
      return cadence;
  }
}

function getTypeLabel(type: RecurringPaymentType): string {
  switch (type) {
    case RecurringPaymentType.SUBSCRIPTION:
      return 'Subscription';
    case RecurringPaymentType.REGULAR_PAYMENT:
      return 'Regular Payment';
    case RecurringPaymentType.REGULAR_INCOME:
      return 'Regular Income';
    default:
      return type;
  }
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

interface SubscriptionDetailScreenProps {
  subscriptionId: string;
}

export function SubscriptionDetailScreen({
  subscriptionId,
}: SubscriptionDetailScreenProps) {
  const { subscription, isLoading } = useSubscription(subscriptionId);
  const { colors } = useTheme();

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <AppScreen
        headerTitle={subscription?.name ?? 'Subscription'}
        isLoading={isLoading}
      >
        {subscription && (
          <ScrollView contentContainerStyle={styles.content}>
            <Card style={styles.headerCard} gap={8}>
              <Text style={[styles.amount, { color: colors.text }]}>
                {formatAmount(subscription.amount, subscription.currency)}
              </Text>
              <Label size="sm" color="#6B7280">
                {getCadenceLabel(subscription.cadence)}
              </Label>
            </Card>

            <Section title="Details">
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Type</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {getTypeLabel(subscription.type)}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Frequency</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {getCadenceLabel(subscription.cadence)}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Currency</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {subscription.currency}
                </Text>
              </View>
              {subscription.startDate && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Start Date</Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>
                    {formatDate(subscription.startDate)}
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
  headerCard: {
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
