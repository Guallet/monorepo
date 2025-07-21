import { createFileRoute, notFound } from "@tanstack/react-router";
import { Stack, Text } from "@mantine/core";

import { AccountDetailsScreen } from "@/features/accounts/screens/AccountDetailsScreen";
import { useAccount } from "@guallet/api-react";

export const Route = createFileRoute("/_app/accounts/$id")({
  component: AccountDetailsPage,
  notFoundComponent: () => {
    return <h1>Account not found</h1>;
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

function AccountDetailsPage() {
  const { id } = Route.useParams();
  return <AccountDetailsScreen accountId={id} />;
}
