import { Button, Loader, Stack, Text } from "@mantine/core";
import { LoaderFunction, useLoaderData, useNavigate } from "react-router-dom";
import { ObAccountDto, getObAccounts } from "./api/connections.api";

interface LoaderData {
  reference: string | null;
  error: string | null;
  errorDetails: string | null;
  accounts: ObAccountDto[];
}

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const reference = url.searchParams.get("ref");
  const error = url.searchParams.get("error");
  const details = url.searchParams.get("details");
  let accounts: ObAccountDto[] = [];

  if (!error && reference) {
    accounts = await getObAccounts(reference);
  }

  return {
    reference,
    error,
    errorDetails: details,
    accounts,
  } as LoaderData;
};

export function AddConnectionCallbackPage() {
  const { error, errorDetails, accounts } = useLoaderData() as LoaderData;
  const navigate = useNavigate();

  if (error) {
    return (
      <ErrorView
        error={error}
        details={errorDetails}
        onActionPressed={() => {
          navigate("/connections", { replace: true });
        }}
      />
    );
  }

  if (accounts.length === 0) {
    return (
      <EmptyAccountsView
        onActionPressed={() => {
          navigate("/connections", { replace: true });
        }}
      />
    );
  }

  return (
    <Stack>
      <Text>
        Connect to the following accounts: {accounts.map((x) => x.name)}
        {accounts.map((x) => {
          return <Text>{x.name}</Text>;
        })}
      </Text>
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
