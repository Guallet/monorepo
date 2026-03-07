import { AppSection } from '@/components/Cards/AppSection';
import { DeleteDialogConfirmation } from '@/components/Dialogs/DeleteDialogConfirmation';
import { Button } from '@/components/ui/button';
import { AccountDto, AccountTypeDto } from '@guallet/api-client';
import { useAccount, useAccountMutations } from '@guallet/api-react';
import { notifications } from '@/lib/notifications';
import { notFound, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { CreditCardDetails } from '../AccountDetails/CreditCardDetails';
import { CurrentAccountDetails } from '../AccountDetails/CurrentAccountDetails';
import { AccountDetailsHeader } from '../components/AccountDetailsHeader';
import { TransactionsSection } from '../components/AccountDetails/TransactionsSection';
import { BaseScreen } from '@/components/Screens/BaseScreen';

interface AccountDetailsScreenProps {
  accountId: string;
}

export function AccountDetailsScreen({
  accountId,
}: Readonly<AccountDetailsScreenProps>) {
  const navigation = useNavigate();
  const { account, isLoading } = useAccount(accountId);
  const { deleteAccountMutation } = useAccountMutations();

  const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] =
    useState(false);

  function showDeleteAccountModal() {
    setIsDeleteAccountModalOpen(true);
  }

  function hideModal() {
    setIsDeleteAccountModalOpen(false);
  }

  async function handleDeleteAccount(): Promise<void> {
    if (!account) {
      return;
    }

    try {
      await deleteAccountMutation.mutateAsync({ id: account.id });
      notifications.show({
        title: 'Account deleted',
        message: 'The account has been deleted',
        color: 'green',
      });
      hideModal();
      navigation({ to: '/accounts' });
    } catch (error) {
      console.error('Error deleting account:', error);
      notifications.show({
        title: 'Error deleting account',
        message: 'There was an error deleting the account. Please try again.',
        color: 'red',
      });
    }
  }

  if (!isLoading && !account) {
    throw notFound();
  }

  return (
    <BaseScreen isLoading={isLoading}>
      <DeleteDialogConfirmation
        isOpen={isDeleteAccountModalOpen}
        onClose={hideModal}
        onConfirm={handleDeleteAccount}
        title="Delete account"
        message="Are you sure you want to delete the account?"
      />

      {account ? (
        <div className="space-y-4">
          <AccountDetailsHeader accountId={accountId} />

          <AppSection itemPadding="xl">
            {AccountDetailsSelector(account)}
          </AppSection>

          <TransactionsSection accountId={account.id} />

          <Button
            type="button"
            className="w-full"
            onClick={() => {
              navigation({
                to: `/accounts/$id/edit`,
                params: { id: account.id },
              });
            }}
          >
            Edit
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="w-full"
            onClick={showDeleteAccountModal}
            disabled={deleteAccountMutation.isPending}
          >
            Delete
          </Button>
        </div>
      ) : null}
    </BaseScreen>
  );
}

function AccountDetailsSelector(account: Readonly<AccountDto>) {
  switch (account.type) {
    case AccountTypeDto.CURRENT_ACCOUNT:
      return <CurrentAccountDetails account={account} />;
    case AccountTypeDto.CREDIT_CARD:
      return <CreditCardDetails account={account} />;
    default:
      return null;
  }
}
