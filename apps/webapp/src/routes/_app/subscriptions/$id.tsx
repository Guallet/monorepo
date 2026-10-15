import { createFileRoute } from '@tanstack/react-router';
import { Text } from '@mantine/core';
import { SubscriptionDetailsScreen } from '@/features/subscriptions/screens/SubscriptionDetailsScreen';

export const Route = createFileRoute('/_app/subscriptions/$id')({
  component: SubscriptionDetailsPage,
  notFoundComponent: () => {
    return <h1>Subscription not found</h1>;
  },
  errorComponent: ({ error }) => {
    console.error('Error loading subscription', error);
    return <Text>Error loading subscription</Text>;
  },
});

function SubscriptionDetailsPage() {
  const { id } = Route.useParams();
  return <SubscriptionDetailsScreen subscriptionId={id} />;
}
