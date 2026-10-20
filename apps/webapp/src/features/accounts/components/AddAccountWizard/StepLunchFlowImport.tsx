import {
  useLunchFlowAccounts,
  useLunchFlowCredential,
  useLunchFlowMutations,
} from '@guallet/api-react';
import { PersonalProviderImportStep } from './PersonalProviderImportStep';

interface StepLunchFlowImportProps {
  onBack: () => void;
  onDone: () => void;
  onConfigure: () => void;
}

export function StepLunchFlowImport({
  onBack,
  onDone,
  onConfigure,
}: Readonly<StepLunchFlowImportProps>) {
  const { credential, isLoading: isCredentialLoading } =
    useLunchFlowCredential();
  const { accounts, isLoading, isError, refetch } = useLunchFlowAccounts(
    credential.configured,
  );
  const { importAccountsMutation, unlinkAccountMutation } =
    useLunchFlowMutations();
  const accountByKey = new Map(
    accounts.map((account) => [account.id, account]),
  );

  return (
    <PersonalProviderImportStep
      provider="lunchFlow"
      isCredentialLoading={isCredentialLoading}
      configured={credential.configured}
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
      onRefresh={() => void refetch()}
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
