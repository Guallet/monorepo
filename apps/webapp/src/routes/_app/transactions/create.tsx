import { AddTransactionScreen } from "@/features/transactions/screens/AddTransactionScreen";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/transactions/create")({
  component: AddTransactionPage,
});

function AddTransactionPage() {
  return <AddTransactionScreen />;
}
