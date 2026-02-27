import { useLocalSearchParams } from 'expo-router';
import { SubscriptionDetailScreen } from '@/features/subscriptions/screens/SubscriptionDetailScreen';

export default function Screen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <SubscriptionDetailScreen subscriptionId={id} />;
}
