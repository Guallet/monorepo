import {
  useBankSyncCredential,
  useBankSyncMutations,
} from '@guallet/api-react';
import { PersonalProviderSettingsCard } from './PersonalProviderSettingsCard';

export function BankSyncSettingsCard() {
  const { credential, isLoading } = useBankSyncCredential();
  const { saveCredentialMutation, deleteCredentialMutation, syncMutation } =
    useBankSyncMutations();

  return (
    <PersonalProviderSettingsCard
      provider="bankSync"
      configured={credential?.configured ?? false}
      keyHint={credential?.keyHint ?? null}
      isLoading={isLoading}
      savePending={saveCredentialMutation.isPending}
      deletePending={deleteCredentialMutation.isPending}
      syncPending={syncMutation.isPending}
      onSave={(apiKey) => saveCredentialMutation.mutateAsync({ apiKey })}
      onDelete={() => deleteCredentialMutation.mutateAsync()}
      onSync={() => syncMutation.mutateAsync()}
    />
  );
}
