import { BudgetDetailsScreen } from "@/features/budgets/screens/BudgetDetailsScreen";
import { Stack, Text } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/budgets/$id")({
  component: BudgetDetailsPage,
  notFoundComponent: () => {
    return <h1>Budget not found</h1>;
  },
  errorComponent: ({ error }) => {
    console.error("Error loading account", error);
    return (
      <Stack>
        <Text>Error loading account</Text>
        <Text>{`${JSON.stringify(error)}`}</Text>
      </Stack>
    );
  },
});

function BudgetDetailsPage() {
  const { id } = Route.useParams();
  return <BudgetDetailsScreen budgetId={id} />;
}
