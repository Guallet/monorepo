import { BaseScreen } from "@/components/Screens/BaseScreen";
import { useOpenBankingConnections } from "@guallet/api-react";
import { Button, Stack, Title } from "@mantine/core";
import { useNavigate } from "@tanstack/react-router";
import { ConnectionCard } from "../components/ConnectionCard";
import EmptyState from "@/components/EmptyState/EmptyState";
import { useTranslation } from "react-i18next";
import { ObConnection } from "@guallet/api-client";

export function ConnectionsScreen() {
  const { connections, isLoading } = useOpenBankingConnections();
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <BaseScreen isLoading={isLoading}>
      {connections.length === 0 && !isLoading ? (
        <EmptyState
          text={t(
            "screens.connections.list.emptyState",
            "No Connections Found. Create a new connection to get started."
          )}
          iconName="IconPlugConnected"
          onClick={() => {
            navigate({ to: "/connections/connect" });
          }}
        />
      ) : (
        <ConnectionList connections={connections} />
      )}
    </BaseScreen>
  );
}

function ConnectionList({
  connections,
}: Readonly<{ connections: ObConnection[] }>) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Stack>
      <Title>{t("screens.connections.list.title", "Connections")}</Title>
      <Button
        onClick={() => {
          navigate({ to: "/connections/connect" });
        }}
      >
        {t("screens.connections.list.addButton", "Add a new connection")}
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
  );
}
