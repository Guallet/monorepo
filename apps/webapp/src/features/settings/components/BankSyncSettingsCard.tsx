import {
  useBankSyncCredential,
  useBankSyncMutations,
} from '@guallet/api-react';
import { useTranslation } from 'react-i18next';
import { PersonalProviderSettingsCard } from './PersonalProviderSettingsCard';

export function BankSyncSettingsCard() {
  const { t } = useTranslation();
  const { credential, isLoading } = useBankSyncCredential();
  const { saveCredentialMutation, deleteCredentialMutation, syncMutation } =
    useBankSyncMutations();

  return (
    <PersonalProviderSettingsCard
      docsUrl="https://banksync.io/docs/api/authentication"
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
          'screens.settings.bankSync.instructions',
          'Connect your banks in BankSync, then create an API key with the banks:read scope. BankSync REST API access requires Standard or higher.',
        ),
        learnMore: t(
          'screens.settings.bankSync.learnMore',
          'View BankSync instructions',
        ),
        keySecurity: t(
          'screens.settings.bankSync.keySecurity',
          'Your key is encrypted in Guallet and is only used to read your connected bank data.',
        ),
        keyConfigured: t(
          'screens.settings.bankSync.keyConfigured',
          'API key configured',
        ),
        apiKeyLabel: t(
          'screens.settings.bankSync.apiKeyLabel',
          'BankSync API key',
        ),
        apiKeyPlaceholder: t(
          'screens.settings.bankSync.apiKeyPlaceholder',
          'Enter a new key to replace it or paste your API key',
        ),
        saveButton: t(
          'screens.settings.bankSync.saveButton',
          'Save and validate key',
        ),
        saveSuccess: t(
          'screens.settings.bankSync.saveSuccess',
          'BankSync API key saved.',
        ),
        saveErrorTitle: t(
          'screens.settings.bankSync.saveErrorTitle',
          'Could not save API key',
        ),
        saveErrorMessage: t(
          'screens.settings.bankSync.saveErrorMessage',
          'Check that your key has REST API access and the banks:read scope.',
        ),
        syncButton: t('screens.settings.bankSync.syncButton', 'Sync now'),
        syncErrorTitle: t(
          'screens.settings.bankSync.syncErrorTitle',
          'Could not sync accounts',
        ),
        syncErrorMessage: t(
          'screens.settings.bankSync.syncErrorMessage',
          'Please try again later.',
        ),
        deleteButton: t('screens.settings.bankSync.deleteButton', 'Remove key'),
        deleteSuccess: t(
          'screens.settings.bankSync.deleteSuccess',
          'BankSync key removed. Imported accounts remain in Guallet.',
        ),
        deleteErrorTitle: t(
          'screens.settings.bankSync.deleteErrorTitle',
          'Could not remove API key',
        ),
        deleteErrorMessage: t(
          'screens.settings.bankSync.deleteErrorMessage',
          'Please try again.',
        ),
        confirmDeleteTitle: t(
          'screens.settings.bankSync.confirmDeleteTitle',
          'Remove BankSync key?',
        ),
        confirmDeleteBody: t(
          'screens.settings.bankSync.confirmDeleteBody',
          'Guallet will stop syncing these accounts. Imported accounts and transactions will remain.',
        ),
      }}
    />
  );
}
