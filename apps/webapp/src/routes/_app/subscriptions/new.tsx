import { AddSubscriptionScreen } from '@/features/subscriptions/screens/AddSubscriptionScreen';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/subscriptions/new')({
  component: AddSubscriptionPage,
});

export function AddSubscriptionPage() {
  return <AddSubscriptionScreen />;
}
