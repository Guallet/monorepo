import { RecurringPaymentsListScreen } from "@/features/recurringPayments/screens/RecurringPaymentsListScreen";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/recurring-payments/")({
  component: RecurringPaymentsPage,
});

function RecurringPaymentsPage() {
  return <RecurringPaymentsListScreen />;
}
