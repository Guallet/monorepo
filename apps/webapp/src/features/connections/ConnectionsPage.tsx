import { Button, Stack, Title } from "@mantine/core";
import { LoaderFunction, useLoaderData, useNavigate } from "react-router-dom";

type LoaderData = {
  connections: string[];
};

export const loader: LoaderFunction = async () => {
  return {
    connections: ["🏦 Bank 1", "🏦 Bank 2", "🏦 Bank 3"],
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
          navigate("/connections/add");
        }}
      >
        Add a new connection
      </Button>

      {connections.map((connection) => (
        <div key={connection}>{connection}</div>
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
          navigate("/connections/add");
        }}
      >
        Add your first connection
      </Button>
    </Stack>
  );
}
