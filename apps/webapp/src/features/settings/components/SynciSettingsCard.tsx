import { useSynciCredential, useSynciMutations } from '@guallet/api-react';
import { PersonalProviderSettingsCard } from './PersonalProviderSettingsCard';

export function SynciSettingsCard() {
  const { credential, isLoading } = useSynciCredential();
  const { saveCredentialMutation, deleteCredentialMutation, syncMutation } =
    useSynciMutations();

  return (
    <PersonalProviderSettingsCard
      provider="synci"
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
