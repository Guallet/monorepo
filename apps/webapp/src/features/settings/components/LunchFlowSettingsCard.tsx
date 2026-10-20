import {
  useLunchFlowCredential,
  useLunchFlowMutations,
} from '@guallet/api-react';
import { PersonalProviderSettingsCard } from './PersonalProviderSettingsCard';

export function LunchFlowSettingsCard() {
  const { credential, isLoading } = useLunchFlowCredential();
  const { saveCredentialMutation, deleteCredentialMutation, syncMutation } =
    useLunchFlowMutations();

  return (
    <PersonalProviderSettingsCard
      provider="lunchFlow"
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
