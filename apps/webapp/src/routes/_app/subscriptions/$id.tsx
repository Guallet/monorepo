import { createFileRoute } from '@tanstack/react-router';
import { Stack, Text } from '@mantine/core';
import { SubscriptionDetailsScreen } from '@/features/subscriptions/screens/SubscriptionDetailsScreen';

export const Route = createFileRoute('/_app/subscriptions/$id')({
  component: SubscriptionDetailsPage,
  notFoundComponent: () => {
    return <h1>Subscription not found</h1>;
  },
  errorComponent: ({ error }) => {
    console.error('Error loading subscription', error);
    return (
      <Stack>
        <Text>Error loading subscription</Text>
        <Text>{`${JSON.stringify(error)}`}</Text>
      </Stack>
    );
  },
});

function SubscriptionDetailsPage() {
  const { id } = Route.useParams();
  return <SubscriptionDetailsScreen subscriptionId={id} />;
}
