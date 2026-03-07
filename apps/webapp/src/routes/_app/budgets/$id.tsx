import { BudgetDetailsScreen } from '@/features/budgets/screens/BudgetDetailsScreen';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/budgets/$id')({
  component: BudgetDetailsPage,
  notFoundComponent: () => {
    return <h1>Budget not found</h1>;
  },
  errorComponent: ({ error }) => {
    console.error('Error loading account', error);
    return (
      <div className="flex flex-col gap-2">
        <p>Error loading account</p>
        <p>{`${JSON.stringify(error)}`}</p>
      </div>
    );
  },
});

function BudgetDetailsPage() {
  const { id } = Route.useParams();
  return <BudgetDetailsScreen budgetId={id} />;
}
