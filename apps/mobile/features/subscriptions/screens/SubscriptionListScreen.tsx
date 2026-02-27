import { useState, useCallback } from 'react';
import {
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { AppScreen } from '@/components/layout/AppScreen';
import { useSubscriptions } from '@guallet/api-react';
import { SubscriptionDto, RecurrenceCadence } from '@guallet/api-client';
import { Money } from '@guallet/money';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState, ListRow } from '@luna-ui/react-native';
import { useRouter } from 'expo-router';

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

function SubscriptionRow({
  subscription,
}: {
  subscription: SubscriptionDto;
}) {
  const router = useRouter();

  return (
    <ListRow
      title={subscription.name}
      subtitle={getCadenceLabel(subscription.cadence)}
      onPress={() => router.push(`/subscription/${subscription.id}`)}
      right={
        <Text style={styles.amount}>
          {formatAmount(subscription.amount, subscription.currency)}
        </Text>
      }
    />
  );
}

export function SubscriptionListScreen() {
  const { subscriptions, isLoading, refetch } = useSubscriptions();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <AppScreen
        headerTitle="Subscriptions"
        isLoading={isLoading && !refreshing}
      >
        {subscriptions.length === 0 && !isLoading ? (
          <EmptyState
            title="No subscriptions yet"
            message="Track your recurring payments by adding subscriptions."
          />
        ) : (
          <FlatList
            data={subscriptions}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <SubscriptionRow subscription={item} />
            )}
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
  amount: {
    fontSize: 16,
    fontWeight: '600',
  },
});
