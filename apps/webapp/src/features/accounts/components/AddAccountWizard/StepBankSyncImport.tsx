import {
  useBankSyncAccounts,
  useBankSyncCredential,
  useBankSyncMutations,
} from '@guallet/api-react';
import { BankSyncAccountDto } from '@guallet/api-client';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const { credential, isLoading: isCredentialLoading } =
    useBankSyncCredential();
  const { accounts, isLoading, isError, refetch } = useBankSyncAccounts(
    credential.configured,
  );
  const { importAccountsMutation, unlinkAccountMutation } =
    useBankSyncMutations();
  const accountByKey = new Map(
    accounts.map((account) => [selectionKey(account), account]),
  );

  return (
    <PersonalProviderImportStep
      labels={{
        title: t('feature.accounts.add.bankSync.title', 'Import from BankSync'),
        subtitle: t(
          'feature.accounts.add.bankSync.subtitle',
          'Select the connected bank accounts to import. Guallet imports available transaction history and then syncs daily.',
        ),
        configureMessage: t(
          'feature.accounts.add.bankSync.configureMessage',
          'Add your BankSync API key in Settings before importing. Create a key with banks:read scope; API key access requires a Standard or higher BankSync plan.',
        ),
        configureButton: t(
          'feature.accounts.add.bankSync.configureButton',
          'Open settings',
        ),
        listError: t(
          'feature.accounts.add.bankSync.listError',
          'Could not load BankSync accounts. Check your API key, REST API plan, and banks:read scope.',
        ),
        empty: t(
          'feature.accounts.add.bankSync.empty',
          'No connected bank accounts are available in BankSync.',
        ),
        importSuccess: t(
          'feature.accounts.add.bankSync.importSuccess',
          'Selected accounts imported from BankSync.',
        ),
        importErrorTitle: t(
          'feature.accounts.add.bankSync.importErrorTitle',
          'Could not import accounts',
        ),
        importErrorMessage: t(
          'feature.accounts.add.bankSync.importErrorMessage',
          'Refresh the account list and try again.',
        ),
        unlinkSuccess: t(
          'feature.accounts.add.bankSync.unlinkSuccess',
          'Account unlinked from BankSync sync. Its Guallet data remains.',
        ),
        unlinkErrorTitle: t(
          'feature.accounts.add.bankSync.unlinkErrorTitle',
          'Could not unlink account',
        ),
        unlinkErrorMessage: t(
          'feature.accounts.add.bankSync.unlinkErrorMessage',
          'Please try again.',
        ),
        unlinkButton: t('feature.accounts.add.bankSync.unlinkButton', 'Unlink'),
        importButton: t(
          'feature.accounts.add.bankSync.importButton',
          'Import selected accounts',
        ),
      }}
      isCredentialLoading={isCredentialLoading}
      configured={credential.configured}
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
      onRefresh={() => void refetch()}
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
