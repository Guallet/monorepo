import {
  useBankSyncAccounts,
  useBankSyncCredential,
  useBankSyncMutations,
} from '@guallet/api-react';
import { BankSyncAccountDto } from '@guallet/api-client';
import { PersonalProviderImportStep } from './PersonalProviderImportStep';

interface StepBankSyncImportProps {
  onBack: () => void;
  onDone: () => void;
  onConfigure: () => void;
}

const selectionKey = (account: BankSyncAccountDto) =>
  `${encodeURIComponent(account.bankId)}:${encodeURIComponent(account.id)}`;

export function StepBankSyncImport({
  onBack,
  onDone,
  onConfigure,
}: Readonly<StepBankSyncImportProps>) {
  const {
    credential,
    isLoading: isCredentialLoading,
    isError: isCredentialError,
    refetch: refetchCredential,
  } = useBankSyncCredential();
  const { accounts, isLoading, isError, refetch } = useBankSyncAccounts(
    credential?.configured === true,
  );
  const { importAccountsMutation, unlinkAccountMutation } =
    useBankSyncMutations();
  const accountByKey = new Map(
    accounts.map((account) => [selectionKey(account), account]),
  );

  return (
    <PersonalProviderImportStep
      provider="bankSync"
      isCredentialLoading={isCredentialLoading}
      isCredentialError={isCredentialError}
      configured={credential?.configured ?? false}
      accounts={accounts.map((account) => ({
        key: selectionKey(account),
        name: account.name,
        institutionName: account.institutionName,
        details: [account.currency],
        linkedAccountId: account.linkedAccountId,
      }))}
      isLoading={isLoading}
      isError={isError}
      isImporting={importAccountsMutation.isPending}
      isUnlinking={unlinkAccountMutation.isPending}
      onRefresh={() => void Promise.all([refetch(), refetchCredential()])}
      onImport={async (selectedKeys) => {
        const selected = selectedKeys
          .map((key) => accountByKey.get(key))
          .filter(
            (account): account is BankSyncAccountDto => account !== undefined,
          )
          .map(({ bankId, id }) => ({ bankId, accountId: id }));
        await importAccountsMutation.mutateAsync({ accounts: selected });
      }}
      onUnlink={async (key) => {
        const account = accountByKey.get(key);
        if (!account) return;
        await unlinkAccountMutation.mutateAsync({
          bankId: account.bankId,
          accountId: account.id,
        });
      }}
      onBack={onBack}
      onDone={onDone}
      onConfigure={onConfigure}
    />
  );
}
