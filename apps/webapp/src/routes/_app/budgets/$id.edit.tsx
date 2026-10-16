import { EditBudgetScreen } from '@/features/budgets/screens/EditBudgetScreen';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/budgets/$id/edit')({
  component: EditBudgetPage,
});

function EditBudgetPage() {
  const { id } = Route.useParams();
  return <EditBudgetScreen budgetId={id} />;
}
