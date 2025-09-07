import { BaseScreen } from "@/components/Screens/BaseScreen";
import { useOpenBankingConnections } from "@guallet/api-react";
import { Button, Stack, Title } from "@mantine/core";
import { useNavigate } from "@tanstack/react-router";
import { ConnectionCard } from "../components/ConnectionCard";

export function ConnectionsScreen() {
  const { connections } = useOpenBankingConnections();
  const navigate = useNavigate();

  return (
    <BaseScreen>
      <Stack>
        <Title>Connections</Title>
        <Button
          onClick={() => {
            navigate({ to: "/connections/connect" });
          }}
        >
          Add a new connection
        </Button>
        <Stack gap="xs">
          {connections.map((connection) => (
            <ConnectionCard
              key={connection.id}
              connectionId={connection.id}
              onClick={() => navigate({ to: `/connections/${connection.id}` })}
            />
          ))}
        </Stack>
      </Stack>
    </BaseScreen>
  );
}
