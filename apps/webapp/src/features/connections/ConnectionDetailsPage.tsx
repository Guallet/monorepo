import {
  Avatar,
  Box,
  Button,
  Card,
  Group,
  Loader,
  LoadingOverlay,
  Stack,
  Text,
  Title,
  Tooltip,
} from "@mantine/core";
import { LoaderFunction, useLoaderData } from "react-router-dom";
import {
  ObAccountDto,
  ObConnection,
  getInstitution,
  getObAccountsForConnection,
  loadConnection,
  syncAccountData,
} from "./api/connections.api";
import { InstitutionDto } from "../settings/institutions/api/institutions.api";
import { useState } from "react";

type LoaderData = {
  connection: ObConnection;
  institution: InstitutionDto;
  accounts: ObAccountDto[];
};

export const loader: LoaderFunction = async ({ params }) => {
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
  } as LoaderData;
};

export function ConnectionDetailsPage() {
  const { connection, accounts, institution } = useLoaderData() as LoaderData;

  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Loading data...");

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
          await syncAccountData(account.id);
        } else {
          console.error("Account has no id", account);
        }
        syncCounter++;
      }
    } catch (e) {
      console.error("Error syncing accounts", e);
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
          <Button color="red">Delete connection</Button>
        </Stack>
      </Box>
    </>
  );
}
