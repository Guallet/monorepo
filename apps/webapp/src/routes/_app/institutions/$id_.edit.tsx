import { createFileRoute } from '@tanstack/react-router';
import { EditInstitutionScreen } from '@/features/institutions/screens/EditInstitutionScreen';

export const Route = createFileRoute('/_app/institutions/$id_/edit')({
  component: EditInstitutionPage,
});

function EditInstitutionPage() {
  const { id } = Route.useParams();

  return <EditInstitutionScreen institutionId={id} />;
}
