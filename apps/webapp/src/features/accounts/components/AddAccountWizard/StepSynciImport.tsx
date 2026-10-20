import {
  useSynciAccounts,
  useSynciCredential,
  useSynciMutations,
} from '@guallet/api-react';
import { PersonalProviderImportStep } from './PersonalProviderImportStep';

interface StepSynciImportProps {
  onBack: () => void;
  onDone: () => void;
  onConfigure: () => void;
}

export function StepSynciImport({
  onBack,
  onDone,
  onConfigure,
}: Readonly<StepSynciImportProps>) {
  const {
    credential,
    isLoading: isCredentialLoading,
    isError: isCredentialError,
    refetch: refetchCredential,
  } = useSynciCredential();
  const { accounts, isLoading, isError, refetch } = useSynciAccounts(
    credential?.configured === true,
  );
  const { importAccountsMutation, unlinkAccountMutation } = useSynciMutations();
  const accountByKey = new Map(
    accounts.map((account) => [account.id, account]),
  );

  return (
    <PersonalProviderImportStep
      provider="synci"
      isCredentialLoading={isCredentialLoading}
      isCredentialError={isCredentialError}
      configured={credential?.configured ?? false}
      accounts={accounts.map((account) => ({
        key: account.id,
        name: account.name,
        institutionName: account.institutionName,
        institutionLogo: account.institutionLogo,
        details: [account.currency, account.provider],
        linkedAccountId: account.linkedAccountId,
      }))}
      isLoading={isLoading}
      isError={isError}
      isImporting={importAccountsMutation.isPending}
      isUnlinking={unlinkAccountMutation.isPending}
      onRefresh={() => void Promise.all([refetch(), refetchCredential()])}
      onImport={async (accountIds) => {
        await importAccountsMutation.mutateAsync({ accountIds });
      }}
      onUnlink={async (accountId) => {
        if (!accountByKey.has(accountId)) return;
        await unlinkAccountMutation.mutateAsync(accountId);
      }}
      onBack={onBack}
      onDone={onDone}
      onConfigure={onConfigure}
    />
  );
}
