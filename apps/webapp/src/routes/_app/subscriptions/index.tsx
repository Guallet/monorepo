import { SubscriptionListScreen } from '@/features/subscriptions/screens/SubscriptionListScreen';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/subscriptions/')({
  component: SubscriptionsPage,
});

function SubscriptionsPage() {
  return <SubscriptionListScreen />;
}
