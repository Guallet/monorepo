import {
  useConnectionMutations,
  useOpenBankingAccountsForConnection,
} from "@guallet/api-react";
import { Button, Card, Flex, Loader, Stack, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

interface ConnectionCallbackScreenProps {
  connectionId?: string | null;
  error?: string | null;
  details?: string | null;
}

export function ConnectionCallbackScreen({
  connectionId,
  error,
  details,
}: Readonly<ConnectionCallbackScreenProps>) {
  const { accounts, isLoading } =
    useOpenBankingAccountsForConnection(connectionId);
  const { linkObAccountsMutation } = useConnectionMutations();
  const navigate = useNavigate();
  const [alreadyLinked, setAlreadyLinked] = useState(false);

  function linkAccounts() {
    if (alreadyLinked) {
      if (accounts.length === 0) {
        console.log("No accounts to link");
        return;
      }

      linkObAccountsMutation.mutate(
        {
          accountIds: accounts.map((account) => account.id),
        },
        {
          onSuccess: () => {
            console.log("Accounts linked successfully");
            notifications.show({
              title: "Accounts linked successfully",
              message: `${accounts.length} accounts linked`,
              color: "green",
            });
          },
          onError: (error) => {
            console.error("Error linking accounts:", error);
          },
        }
      );

      setAlreadyLinked(true);
    } else {
      console.log("Already linked accounts, skipping linking");
    }
  }

  useEffect(() => {
    if (connectionId && accounts.length > 0) {
      linkAccounts();
    }
  }, [connectionId, accounts]);

  if (error) {
    return (
      <ErrorView
        error={error}
        details={details}
        onActionPressed={() => {
          navigate({ to: "/connections", replace: true });
        }}
      />
    );
  }

  if (linkObAccountsMutation.isError) {
    return (
      <ErrorView
        error={linkObAccountsMutation.error?.message}
        details={linkObAccountsMutation.error?.cause?.toString()}
        onActionPressed={() => {
          navigate({ to: "/connections", replace: true });
        }}
      />
    );
  }

  if (isLoading || linkObAccountsMutation.isPending) {
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

  if (accounts.length === 0) {
    return (
      <EmptyAccountsView
        onActionPressed={() => {
          navigate({ to: "/connections", replace: true });
        }}
      />
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
  details?: string | null;
  onActionPressed: () => void;
}
function ErrorView({
  error,
  details,
  onActionPressed,
}: Readonly<ErrorViewProps>) {
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
function EmptyAccountsView({
  onActionPressed,
}: Readonly<EmptyAccountsViewProps>) {
  return (
    <Stack>
      <Text>There are no accounts available to connect</Text>
      <Button onClick={onActionPressed}>Go back to connections</Button>
    </Stack>
  );
}
