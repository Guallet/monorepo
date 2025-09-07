import { fetch_delete } from "@/api/fetchHelper";
import { AccountAvatar } from "@/components/AccountAvatar/AccountAvatar";
import { AmountLabel } from "@/components/Amount/AmountLabel";
import { AppSection } from "@/components/Cards/AppSection";
import { CategoryAvatar } from "@/components/Categories/CategoryAvatar";
import {
  AccountDto,
  AccountTypeDto,
  TransactionDto,
} from "@guallet/api-client";
import { useAccount, useAccountTransactions } from "@guallet/api-react";
import { Money } from "@guallet/money";
import {
  Loader,
  Modal,
  Stack,
  Group,
  Space,
  Button,
  Center,
  Text,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useNavigate, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { CreditCardDetails } from "../AccountDetails/CreditCardDetails";
import { CurrentAccountDetails } from "../AccountDetails/CurrentAccountDetails";
import { BaseScreen } from "@/components/Screens/BaseScreen";
import { AccountDetailsHeader } from "../components/AccountDetailsHeader";

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
              title: "Account deleted",
              message: "The account has been deleted",
              color: "green",
            });
            navigation({ to: "/accounts" });
          }}
        />
      </Modal>

      <Stack>
        <AccountDetailsHeader accountId={accountId} />

        {/* Show info dependent on account type */}
        {AccountDetailsSelector(account)}
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
  async function deleteAccount() {
    await fetch_delete(`accounts/${account.id}`);
    onAccountDeleted();
  }

  return (
    <Stack>
      <Text>Are you sure you want to delete the account?</Text>
      <Text size="sm"> This action and cannot be undone.</Text>
      <Group justify="flex-end">
        <Button onClick={onCancel}>Cancel</Button>
        <Button
          color="red"
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
    default:
      return null;
  }
}

interface TransactionsSectionProps {
  accountId: string;
}
function TransactionsSection({
  accountId,
}: Readonly<TransactionsSectionProps>) {
  const navigation = useNavigate();
  const { transactions, isLoading } = useAccountTransactions(accountId);

  return (
    <AppSection title="Latest transactions">
      {isLoading ? (
        <Center>
          <Loader />
        </Center>
      ) : transactions.length === 0 ? (
        <Center>
          <Text>No transactions found for this month</Text>
        </Center>
      ) : (
        <Stack>
          {transactions.map((transaction) => (
            <TransactionRow key={transaction.id} transaction={transaction} />
          ))}
        </Stack>
      )}
      <Button
        variant="outline"
        onClick={() => {
          navigation({
            to: "/transactions",
            search: {
              accounts: [accountId],
              page: 1,
              pageSize: 50,
            },
          });
        }}
      >
        View all account transactions
      </Button>
    </AppSection>
  );
}

function TransactionRow({
  transaction,
}: Readonly<{ transaction: TransactionDto }>) {
  const amount = Money.fromCurrencyCode({
    amount: transaction.amount,
    currencyCode: transaction.currency,
  });

  return (
    <Group>
      <CategoryAvatar categoryId={transaction.categoryId} size={40} />
      <Text
        style={{
          flexGrow: 1,
        }}
      >
        {transaction.description}
      </Text>
      <Text>{amount.format()}</Text>
    </Group>
  );
}
