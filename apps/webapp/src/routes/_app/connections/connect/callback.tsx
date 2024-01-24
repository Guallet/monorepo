import { FileRoute, useNavigate } from "@tanstack/react-router";

import { Button, Card, Flex, Loader, Stack, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useEffect, useState } from "react";
import { z } from "zod";
import {
  ObAccountDto,
  getObAccountsForConnection,
  linkObAccounts,
} from "@/features/connections/api/connections.api";

const pageSearchSchema = z.object({
  ref: z.string().optional().nullable(),
  error: z.string().optional().nullable(),
  details: z.string().optional().nullable(),
});

export const Route = new FileRoute(
  "/_app/connections/connect/callback"
).createRoute({
  component: AddConnectionCallbackPage,
  validateSearch: pageSearchSchema,
  loaderDeps: ({ search: { ref, error, details } }) => ({
    ref,
    error,
    details,
  }),
  loader: async ({ deps: { ref, error, details } }) =>
    loader({
      reference: ref ?? null,
      error: error ?? null,
      details: details ?? null,
    }),
});

async function loader(args: {
  reference: string | null;
  error: string | null;
  details: string | null;
}) {
  const { reference, error, details } = args;
  let accounts: ObAccountDto[] = [];

  if (!error && reference) {
    accounts = await getObAccountsForConnection(reference);
  }

  return {
    reference,
    error,
    errorDetails: details,
    accounts,
  };
}

function AddConnectionCallbackPage() {
  const { error, errorDetails, accounts } = Route.useLoaderData();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  async function linkAccounts() {
    // For each account, call the API to create the connection
    const response = await linkObAccounts(
      accounts.map((a) => a.id).filter((a) => a !== null) as string[]
    );
    console.log(response);
  }

  useEffect(() => {
    if (!error) {
      // Connect the accounts to the user
      setIsLoading(true);
      linkAccounts()
        .then(() => {})
        .catch((error) => {
          console.error(error);
          notifications.show({
            title: "Error connecting the accounts",
            message: `${error}`,
            color: "red",
          });
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [accounts, error, navigate]);

  if (error) {
    return (
      <ErrorView
        error={error}
        details={errorDetails}
        onActionPressed={() => {
          navigate({ to: "/connections", replace: true });
        }}
      />
    );
  }

  if (accounts.length === 0) {
    return (
      <EmptyAccountsView
        onActionPressed={() => {
          navigate({ to: "/connections", replace: true });
        }}
      />
    );
  }

  if (isLoading) {
    return (
      <Flex
        mih={50}
        gap="md"
        justify="center"
        align="center"
        direction="column"
        wrap="wrap"
      >
        <Loader />
        <Text>Syncing accounts...</Text>
      </Flex>
    );
  }

  return (
    <Stack>
      <Text>Connected to the following accounts:</Text>
      {accounts.map((account) => {
        return (
          <Card withBorder key={account.id}>
            <Stack key={account.id}>
              <Text>{account.details.name ?? account.details.ownerName}</Text>
              <Text>Details: {account.details.details}</Text>
              <Text>Account number: {account.details.bban}</Text>
              <Text>Iban: {account.details.iban}</Text>
              <Text>Currency: {account.details.currency}</Text>
              <Text>Type: {account.details.cashAccountType}</Text>
            </Stack>
          </Card>
        );
      })}
      <Button
        onClick={() => {
          navigate({ to: "/accounts", replace: true });
        }}
      >
        Go back to accounts
      </Button>
    </Stack>
  );
}

interface ErrorViewProps {
  error: string;
  details: string | null;
  onActionPressed: () => void;
}
function ErrorView({ error, details, onActionPressed }: ErrorViewProps) {
  return (
    <Stack>
      <Text>Error adding the account</Text>
      <Text>Error: {error}</Text>
      {details && <Text>What went wrong: {details}</Text>}
      <Button onClick={onActionPressed}>Go back to connections</Button>
    </Stack>
  );
}

interface EmptyAccountsViewProps {
  onActionPressed: () => void;
}
function EmptyAccountsView({ onActionPressed }: EmptyAccountsViewProps) {
  return (
    <Stack>
      <Text>There are no accounts available to connect</Text>
      <Button onClick={onActionPressed}>Go back to connections</Button>
    </Stack>
  );
}
