import { DeleteButton } from '@/components/Buttons/DeleteButton';
import { AppSection } from '@/components/Cards/AppSection';
import { BaseScreen } from '@/components/Screens/BaseScreen';
import { Button } from '@/components/ui/button';
import { useOpenBankingAccountsForConnection } from '@guallet/api-react';
import { DebugJson } from '@guallet/ui-react';
import { useTranslation } from 'react-i18next';
import { ConnectionCard } from '../components/ConnectionCard';

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
      <div className="space-y-4">
        <ConnectionCard connectionId={connectionId} />
        <AppSection title="Accounts">
          <DebugJson data={accounts} />
        </AppSection>
        <AppSection>
          <div className="space-y-2">
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
                console.log('Delete connection action is not implemented yet.');
              }}
            >
              {t("screens.connections.details.deleteButton.label", "Delete")}
            </DeleteButton>
          </div>
        </AppSection>
      </div>
    </BaseScreen>
  );
}
