import { EditRuleScreen } from '@/features/rules/screens/EditRuleScreen';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/categories/rules/$id_/edit')({
  component: EditRulePage,
});

function EditRulePage() {
  const { id } = Route.useParams();

  return <EditRuleScreen id={id} />;
}
