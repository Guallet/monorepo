import { createFileRoute } from '@tanstack/react-router';
import { SubscriptionDetailsScreen } from '@/features/subscriptions/screens/SubscriptionDetailsScreen';

export const Route = createFileRoute('/_app/subscriptions/$id')({
  component: SubscriptionDetailsPage,
  notFoundComponent: () => {
    return <h1>Subscription not found</h1>;
  },
  errorComponent: ({ error }) => {
    console.error('Error loading subscription', error);
    return (
      <div className="flex flex-col gap-2">
        <p>Error loading subscription</p>
        <p>{`${JSON.stringify(error)}`}</p>
      </div>
    );
  },
});

function SubscriptionDetailsPage() {
  const { id } = Route.useParams();
  return <SubscriptionDetailsScreen subscriptionId={id} />;
}
