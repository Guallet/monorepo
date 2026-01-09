import { RecurringPaymentNewScreen } from "@/features/recurringPayments/screens/RecurringPaymentNewScreen";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/recurring-payments/new")({
  component: RecurringPaymentNewPage,
});

function RecurringPaymentNewPage() {
  return <RecurringPaymentNewScreen />;
}
