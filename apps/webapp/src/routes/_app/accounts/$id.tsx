import { createFileRoute } from '@tanstack/react-router';
import { Text } from '@mantine/core';

import { AccountDetailsScreen } from '@/features/accounts/screens/AccountDetailsScreen';

export const Route = createFileRoute('/_app/accounts/$id')({
  component: AccountDetailsPage,
  notFoundComponent: () => {
    return <h1>Account not found</h1>;
  },

  errorComponent: ({ error }) => {
    console.error('Error loading account', error);
    return <Text>Error loading account</Text>;
  },
});

function AccountDetailsPage() {
  const { id } = Route.useParams();
  return <AccountDetailsScreen accountId={id} />;
}
