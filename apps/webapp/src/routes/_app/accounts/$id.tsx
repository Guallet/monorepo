import { createFileRoute } from "@tanstack/react-router";

import { AccountDetailsScreen } from "@/features/accounts/screens/AccountDetailsScreen";

export const Route = createFileRoute("/_app/accounts/$id")({
  component: AccountDetailsPage,
  notFoundComponent: () => {
    return <h1>Account not found</h1>;
  },

  errorComponent: ({ error }) => {
    console.error("Error loading account", error);
    return (
      <div className="space-y-2">
        <p>Error loading account</p>
        <p>{`${JSON.stringify(error)}`}</p>
      </div>
    );
  },
});

function AccountDetailsPage() {
  const { id } = Route.useParams();
  return <AccountDetailsScreen accountId={id} />;
}
