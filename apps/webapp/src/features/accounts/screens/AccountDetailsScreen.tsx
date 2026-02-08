import { AppSection } from '@/components/Cards/AppSection';
import { AccountDto, AccountTypeDto } from '@guallet/api-client';
import { useAccount, useAccountMutations } from '@guallet/api-react';
import {
  Loader,
  Modal,
  Stack,
  Group,
  Space,
  Button,
  Text,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useNavigate, notFound } from '@tanstack/react-router';
import { useState } from 'react';
import { CreditCardDetails } from '../AccountDetails/CreditCardDetails';
import { CurrentAccountDetails } from '../AccountDetails/CurrentAccountDetails';
import { PropertyDetails } from '../AccountDetails/PropertyDetails';
import { BaseScreen } from '@/components/Screens/BaseScreen';
import { AccountDetailsHeader } from '../components/AccountDetailsHeader';
import { TransactionsSection } from '../components/AccountDetails/TransactionsSection';

interface AccountDetailsScreenProps {
  accountId: string;
}

export function AccountDetailsScreen({
  accountId,
}: Readonly<AccountDetailsScreenProps>) {
  const navigation = useNavigate();

  const { account, isLoading } = useAccount(accountId);

  const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] =
    useState(false);

  function showDeleteAccountModal() {
    setIsDeleteAccountModalOpen(true);
  }

  function hideModal() {
    setIsDeleteAccountModalOpen(false);
  }

  if (isLoading) {
    return <Loader />;
  }

  if (!account) {
    throw notFound();
  }

  return (
    <BaseScreen isLoading={isLoading}>
      <Modal
        centered
        opened={isDeleteAccountModalOpen}
        onClose={hideModal}
        title="Delete account"
        size="auto"
      >
        <DeleteAccountDialog
          account={account}
          onCancel={hideModal}
          onAccountDeleted={() => {
            notifications.show({
              title: 'Account deleted',
              message: 'The account has been deleted',
              color: 'green',
            });
            navigation({ to: '/accounts' });
          }}
        />
      </Modal>

      <Stack>
        <AccountDetailsHeader accountId={accountId} />

        {/* Show info dependent on account type */}
        <AppSection itemPadding="xl">
          {AccountDetailsSelector(account)}
        </AppSection>
        <Space />
        <TransactionsSection accountId={account.id} />

        <Space />

        <Button
          fullWidth
          onClick={() => {
            navigation({
              to: `/accounts/$id/edit`,
              params: { id: account.id },
            });
          }}
        >
          Edit
        </Button>
        <Button fullWidth color="red" onClick={showDeleteAccountModal}>
          Delete
        </Button>
      </Stack>
    </BaseScreen>
  );
}

interface DialogProps {
  account: AccountDto;
  onCancel: () => void;
  onAccountDeleted: () => void;
}
function DeleteAccountDialog({
  account,
  onCancel,
  onAccountDeleted,
}: Readonly<DialogProps>) {
  const { deleteAccountMutation } = useAccountMutations();

  async function deleteAccount() {
    try {
      await deleteAccountMutation.mutateAsync({ id: account.id });
      onAccountDeleted();
    } catch (error) {
      console.error('Error deleting account:', error);
      notifications.show({
        title: 'Error deleting account',
        message: 'There was an error deleting the account. Please try again.',
        color: 'red',
      });
    }
  }

  return (
    <Stack>
      <Text>Are you sure you want to delete the account?</Text>
      <Text size="sm"> This action and cannot be undone.</Text>
      <Group justify="flex-end">
        <Button onClick={onCancel}>Cancel</Button>
        <Button
          color="red"
          loading={deleteAccountMutation.isPending}
          onClick={() => {
            deleteAccount();
          }}
        >
          Delete account
        </Button>
      </Group>
    </Stack>
  );
}

function AccountDetailsSelector(account: Readonly<AccountDto>) {
  // TODO: Create different components for each account type
  switch (account.type) {
    case AccountTypeDto.CURRENT_ACCOUNT:
      return <CurrentAccountDetails account={account} />;
    case AccountTypeDto.CREDIT_CARD:
      return <CreditCardDetails account={account} />;
    case AccountTypeDto.PROPERTY:
      return <PropertyDetails account={account} />;
    default:
      return null;
  }
}
