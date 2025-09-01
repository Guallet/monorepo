import { createFileRoute } from "@tanstack/react-router";

import { TransactionInboxScreen } from "@/features/transactions/screens/TransactionInboxScreen";

export const Route = createFileRoute("/_app/transactions/inbox")({
  component: TransactionInboxPage,
});

function TransactionInboxPage() {
  return <TransactionInboxScreen />;
}
