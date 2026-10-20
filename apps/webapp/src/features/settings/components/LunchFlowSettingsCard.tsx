import {
  useLunchFlowCredential,
  useLunchFlowMutations,
} from '@guallet/api-react';
import { useTranslation } from 'react-i18next';
import { PersonalProviderSettingsCard } from './PersonalProviderSettingsCard';

export function LunchFlowSettingsCard() {
  const { t } = useTranslation();
  const { credential, isLoading } = useLunchFlowCredential();
  const { saveCredentialMutation, deleteCredentialMutation, syncMutation } =
    useLunchFlowMutations();

  return (
    <PersonalProviderSettingsCard
      docsUrl="https://www.lunchflow.app/docs/api/personal-api-overview"
      configured={credential.configured}
      keyHint={credential.keyHint}
      isLoading={isLoading}
      savePending={saveCredentialMutation.isPending}
      deletePending={deleteCredentialMutation.isPending}
      syncPending={syncMutation.isPending}
      onSave={(apiKey) => saveCredentialMutation.mutateAsync({ apiKey })}
      onDelete={() => deleteCredentialMutation.mutateAsync()}
      onSync={() => syncMutation.mutateAsync()}
      labels={{
        instructions: t(
          'screens.settings.lunchFlow.instructions',
          'Connect your banks in Lunch Flow, create a REST API destination, and enable the accounts you want Guallet to access.',
        ),
        learnMore: t(
          'screens.settings.lunchFlow.learnMore',
          'View Lunch Flow instructions',
        ),
        keyConfigured: t(
          'screens.settings.lunchFlow.keyConfigured',
          'API key configured',
        ),
        apiKeyLabel: t(
          'screens.settings.lunchFlow.apiKeyLabel',
          'Lunch Flow API key',
        ),
        apiKeyPlaceholder: t(
          'screens.settings.lunchFlow.apiKeyPlaceholder',
          'Enter a new key to replace it or paste your API key',
        ),
        saveButton: t(
          'screens.settings.lunchFlow.saveButton',
          'Save and validate key',
        ),
        saveSuccess: t(
          'screens.settings.lunchFlow.saveSuccess',
          'Lunch Flow API key saved.',
        ),
        saveErrorTitle: t(
          'screens.settings.lunchFlow.saveErrorTitle',
          'Could not save API key',
        ),
        saveErrorMessage: t(
          'screens.settings.lunchFlow.saveErrorMessage',
          'Check the key and try again.',
        ),
        syncButton: t('screens.settings.lunchFlow.syncButton', 'Sync now'),
        syncErrorTitle: t(
          'screens.settings.lunchFlow.syncErrorTitle',
          'Could not sync accounts',
        ),
        syncErrorMessage: t(
          'screens.settings.lunchFlow.syncErrorMessage',
          'Please try again later.',
        ),
        deleteButton: t(
          'screens.settings.lunchFlow.deleteButton',
          'Remove key',
        ),
        deleteSuccess: t(
          'screens.settings.lunchFlow.deleteSuccess',
          'Lunch Flow key removed. Imported accounts remain in Guallet.',
        ),
        deleteErrorTitle: t(
          'screens.settings.lunchFlow.deleteErrorTitle',
          'Could not remove API key',
        ),
        deleteErrorMessage: t(
          'screens.settings.lunchFlow.deleteErrorMessage',
          'Please try again.',
        ),
        confirmDeleteTitle: t(
          'screens.settings.lunchFlow.confirmDeleteTitle',
          'Remove Lunch Flow key?',
        ),
        confirmDeleteBody: t(
          'screens.settings.lunchFlow.confirmDeleteBody',
          'Guallet will stop syncing these accounts. Imported accounts and transactions will remain.',
        ),
      }}
    />
  );
}
