import { EditTransactionScreen } from "@/features/transactions/screens/EditTransactionScreen";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/transactions/$id_/edit")({
  component: EditTransactionPage,
});

function EditTransactionPage() {
  const { id } = Route.useParams();
  return <EditTransactionScreen transactionId={id} />;
}
