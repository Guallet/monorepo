import { EditSubscriptionScreen } from '@/features/subscriptions/screens/EditSubscriptionScreen';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/subscriptions/$id_/edit')({
  component: EditSubscriptionPage,
});

function EditSubscriptionPage() {
  const { id } = Route.useParams();
  return <EditSubscriptionScreen subscriptionId={id} />;
}
