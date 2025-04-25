import { AccountListScreen } from "@/features/accounts/screens/AccountListScreen";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/accounts/")({
  component: AccountsPage,
});

function AccountsPage() {
  return <AccountListScreen />;
}
