import {
  Avatar,
  Button,
  Group,
  Stack,
  Text,
  Title,
  Tooltip,
} from "@mantine/core";
import { LoaderFunction, useLoaderData, useNavigate } from "react-router-dom";
import { ObConnection, loadConnections } from "./api/connections.api";

type LoaderData = {
  connection: ObConnection;
};

export const loader: LoaderFunction = async ({ params }) => {
  const { id } = params;
  const connections = await loadConnections();

  // Load the insititutions from the API to get the src for the logo

  return {
    connection: connections.find((connection) => connection.id === id),
  } as LoaderData;
};

export function ConnectionDetailsPage() {
  const { connection } = useLoaderData() as LoaderData;
  const navigate = useNavigate();

  console.log("Page data:", connection);

  return (
    <Stack>
      <Title>Connection {connection.id}</Title>
      <Group>
        <Tooltip label={connection.institution_id}>
          <Avatar
            src={connection.institution_id}
            alt={connection.institution_id}
          />
        </Tooltip>
        <Stack>
          <Text>Accounts: {connection.accounts}</Text>
          <Text>{connection.link}</Text>
          <Text>{JSON.stringify(connection, null, 2)}</Text>
        </Stack>
      </Group>
      <Button>Refresh connection</Button>
      <Button>Update data now</Button>
      <Button color="red">Delete connection</Button>
    </Stack>
  );
}
