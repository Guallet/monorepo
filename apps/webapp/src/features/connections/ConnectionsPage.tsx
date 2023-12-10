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
  connections: ObConnection[];
};

export const loader: LoaderFunction = async () => {
  const connections = await loadConnections();

  // Load the insititutions from the API to get the src for the logo

  return {
    connections: connections,
  } as LoaderData;
};

export function ConnectionsPage() {
  const { connections } = useLoaderData() as LoaderData;
  const navigate = useNavigate();

  if (connections.length === 0) return <EmptyConnectionsView />;

  return (
    <Stack>
      <Title>Connections</Title>
      <Button
        onClick={() => {
          navigate("/connections/connect");
        }}
      >
        Add a new connection
      </Button>

      {connections.map((connection) => (
        <Group
          key={connection.id}
          onClick={() => {
            navigate(`/connections/${connection.id}`);
          }}
        >
          <Tooltip label={connection.institution_id}>
            <Avatar src={connection.institution_id} />
          </Tooltip>
          <Text>{connection.status}</Text>
          <Text>{connection.created}</Text>
        </Group>
      ))}
    </Stack>
  );
}

function EmptyConnectionsView() {
  const navigate = useNavigate();
  return (
    <Stack>
      <Button
        onClick={() => {
          navigate("/connections/connect");
        }}
      >
        Add your first connection
      </Button>
    </Stack>
  );
}
