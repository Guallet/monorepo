// path: ":id",
// element: <ConnectionDetailsPage />,
// loader: connectionDetailsLoader,

import {
  loadConnection,
  getObAccountsForConnection,
  deleteConnection,
  syncAccountData,
  getInstitution,
} from "@/features/connections/api/connections.api";
import {
  Box,
  LoadingOverlay,
  Stack,
  Loader,
  Group,
  Avatar,
  Title,
  Card,
  Button,
  Text,
  Tooltip,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/_app/connections/$id")({
  component: ConnectionDetailsPage,
  loader: async ({ params }) => loader({ id: params.id }),
});

async function loader(params: { id: string }) {
  const { id } = params;
  if (!id) {
    throw Error("Invalid navigation args");
  }

  const connection = await loadConnection(id);
  const institution = await getInstitution(connection.institution_id);
  const accounts = await getObAccountsForConnection(id);

  return {
    connection: connection,
    institution: institution,
    accounts: accounts,
  };
}

function ConnectionDetailsPage() {
  const { connection, accounts, institution } = Route.useLoaderData();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Loading data...");

  const onDeleteConnection = async () => {
    try {
      setIsLoading(true);
      await deleteConnection(connection.id);
      navigate({ to: "/connections" });
      notifications.show({
        title: "Connection deleted",
        message: "Open Banking Connection deleted",
      });
    } catch (e) {
      console.error("Error syncing accounts", e);
      notifications.show({
        color: "red",
        title: "Error deleting the connection",
        message: "Something went wrong: " + e,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const syncConnectionData = async () => {
    try {
      setIsLoading(true);
      setLoadingMessage("Syncing connection data");
      let syncCounter = 1;
      for (const account of accounts) {
        if (account.id) {
          setLoadingMessage(
            `Syncing account ${syncCounter} of ${accounts.length}`
          );
          const accountResponse = await syncAccountData(account.id);
          if (accountResponse.ok === false) {
            const errorMessage = await accountResponse.json();
            console.error("Account sync failed", errorMessage);
            throw new Error("Account sync failed: " + errorMessage.message);
          }
        } else {
          console.error("Account has no id", account);
        }
        syncCounter++;
      }

      // Display notification
      notifications.show({
        title: "Account sync",
        message: `${accounts.length} ${
          accounts.length === 1 ? "account" : "accounts"
        } synced! 🤩`,
      });
    } catch (e) {
      console.error("Error syncing accounts", e);
      notifications.show({
        color: "red",
        title: "Sync error",
        message: "Something went wrong: " + e,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Box pos="relative">
        <LoadingOverlay
          visible={isLoading}
          zIndex={1000}
          overlayProps={{ radius: "sm", blur: 2 }}
          loaderProps={{
            children: (
              <Stack align="center">
                <Loader />
                <Text>{loadingMessage}</Text>
              </Stack>
            ),
          }}
        />
        <Stack>
          <Group>
            <Tooltip label={institution.name}>
              <Avatar src={institution.image_src} alt={institution.name} />
            </Tooltip>
            <Title>{institution.name}</Title>
          </Group>
          <Stack>
            <Text>Accounts: </Text>
            {accounts !== null || accounts !== undefined ? (
              accounts.map((a) => {
                const { id, details, metadata } = a;

                if (details === null) {
                  return (
                    <Card
                      key={id}
                      shadow="sm"
                      padding="lg"
                      radius="md"
                      withBorder
                    >
                      <Text>Name: {metadata.owner_name}</Text>
                      <Text>Connection Status: {metadata.status}</Text>
                    </Card>
                  );
                }

                return (
                  <Card
                    key={id}
                    shadow="sm"
                    padding="lg"
                    radius="md"
                    withBorder
                  >
                    <Text>{details.name ?? details.ownerName}</Text>
                    <Text>Details: {details.details}</Text>
                    <Text>Account type: {details.cashAccountType}</Text>
                    <Text>Currency: {details.currency}</Text>
                    <Text>Connection Status {metadata.status}</Text>
                  </Card>
                );
              })
            ) : (
              <Text>Accounts Error</Text>
            )}
          </Stack>
          <Button>Refresh connection</Button>
          <Button
            onClick={() => {
              syncConnectionData();
            }}
          >
            Update data now
          </Button>
          <Button
            color="red"
            onClick={() => {
              onDeleteConnection();
            }}
          >
            Delete connection
          </Button>
        </Stack>
      </Box>
    </>
  );
}
