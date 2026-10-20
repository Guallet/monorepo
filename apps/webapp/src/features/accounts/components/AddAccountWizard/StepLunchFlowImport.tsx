import {
  useLunchFlowAccounts,
  useLunchFlowCredential,
  useLunchFlowMutations,
} from '@guallet/api-react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
      labels={{
        title: t(
          'feature.accounts.add.lunchFlow.title',
          'Import from Lunch Flow',
        ),
        subtitle: t(
          'feature.accounts.add.lunchFlow.subtitle',
          'Choose the accounts enabled in your Lunch Flow API destination.',
        ),
        configureMessage: t(
          'feature.accounts.add.lunchFlow.configureMessage',
          'Add your Lunch Flow API key in Settings before importing accounts. Connect your banks and enable them for the API destination in Lunch Flow first.',
        ),
        configureButton: t(
          'feature.accounts.add.lunchFlow.configureButton',
          'Open settings',
        ),
        listError: t(
          'feature.accounts.add.lunchFlow.listError',
          'Could not load Lunch Flow accounts. Check your key and account access settings.',
        ),
        empty: t(
          'feature.accounts.add.lunchFlow.empty',
          'No accounts are available. Connect a bank in Lunch Flow and enable it in your API destination.',
        ),
        importSuccess: t(
          'feature.accounts.add.lunchFlow.importSuccess',
          'Selected accounts imported from Lunch Flow.',
        ),
        importErrorTitle: t(
          'feature.accounts.add.lunchFlow.importErrorTitle',
          'Could not import accounts',
        ),
        importErrorMessage: t(
          'feature.accounts.add.lunchFlow.importErrorMessage',
          'Refresh the account list and try again.',
        ),
        unlinkSuccess: t(
          'feature.accounts.add.lunchFlow.unlinkSuccess',
          'Account unlinked from Lunch Flow sync. Its Guallet data remains.',
        ),
        unlinkErrorTitle: t(
          'feature.accounts.add.lunchFlow.unlinkErrorTitle',
          'Could not unlink account',
        ),
        unlinkErrorMessage: t(
          'feature.accounts.add.lunchFlow.unlinkErrorMessage',
          'Please try again.',
        ),
        unlinkButton: t(
          'feature.accounts.add.lunchFlow.unlinkButton',
          'Unlink',
        ),
        importButton: t(
          'feature.accounts.add.lunchFlow.importButton',
          'Import selected',
        ),
      }}
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
