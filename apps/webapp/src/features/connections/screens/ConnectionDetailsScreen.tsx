import { BaseScreen } from "@/components/Screens/BaseScreen";
import { useOpenBankingAccountsForConnection } from "@guallet/api-react";
import { DebugJson } from "@guallet/ui-react";
import { Button, Stack } from "@mantine/core";
import { ConnectionCard } from "../components/ConnectionCard";
import { DeleteButton } from "@/components/Buttons/DeleteButton";
import { AppSection } from "@/components/Cards/AppSection";
import { useTranslation } from "react-i18next";

interface ConnectionDetailsScreenProps {
  connectionId: string;
}

export function ConnectionDetailsScreen({
  connectionId,
}: Readonly<ConnectionDetailsScreenProps>) {
  const { t } = useTranslation();
  const { accounts, isLoading } =
    useOpenBankingAccountsForConnection(connectionId);

  return (
    <BaseScreen isLoading={isLoading}>
      <Stack>
        <ConnectionCard connectionId={connectionId} />
        <AppSection title="Accounts">
          <DebugJson data={accounts} />
        </AppSection>
        <AppSection>
          <Stack>
            <Button
              variant="outline"
              onClick={() => {
                console.log("TODO: Handle refresh connection");
              }}
            >
              {t(
                "screens.connections.details.refreshButton.label",
                "Refresh Connection"
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                console.log("TODO: Handle update accounts connection");
              }}
            >
              {t(
                "screens.connections.details.updateButton.label",
                "Update Connected accounts"
              )}
            </Button>
            <DeleteButton
              modalTitle={t(
                "screens.connections.details.deleteButton.modalTitle",
                "Delete connection"
              )}
              modalMessage={t(
                "screens.connections.details.deleteButton.modalMessage",
                "Are you sure you want to delete this connection?"
              )}
              onDelete={() => {
                //TODO: Handle delete connection
              }}
            >
              {t("screens.connections.details.deleteButton.label", "Delete")}
            </DeleteButton>
          </Stack>
        </AppSection>
      </Stack>
    </BaseScreen>
  );
}
