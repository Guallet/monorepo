import { createFileRoute } from '@tanstack/react-router';
import { EditAccountScreen } from '@/features/accounts/screens/EditAccountSceen';

export const Route = createFileRoute('/_app/accounts/$id_/edit')({
  component: EditAccountPage,
});

function EditAccountPage() {
  const { id } = Route.useParams();

  return <EditAccountScreen accountId={id} />;
}
