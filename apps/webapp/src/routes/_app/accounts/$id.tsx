import { useNavigate, notFound, createFileRoute } from "@tanstack/react-router";
import {
  Group,
  Modal,
  Stack,
  Text,
  Button,
  Loader,
  Center,
  Space,
} from "@mantine/core";
import { fetch_delete } from "@core/api/fetchHelper";
import { CurrentAccountDetails } from "@/features/accounts/AccountDetails/CurrentAccountDetails";
import { CreditCardDetails } from "@/features/accounts/AccountDetails/CreditCardDetails";
import { useState } from "react";
import { notifications } from "@mantine/notifications";
import {
  AccountDto,
  AccountTypeDto,
  TransactionDto,
} from "@guallet/api-client";
import { useAccount, useAccountTransactions } from "@guallet/api-react";
import { AppSection } from "@/components/Cards/AppSection";
import { Money } from "@guallet/money";
import { AccountAvatar } from "@/components/AccountAvatar/AccountAvatar";
import { CategoryAvatar } from "@/components/Categories/CategoryAvatar";
import { AmountLabel } from "@/components/Amount/AmountLabel";
import { getAccountTypeTitleSingular } from "@/features/accounts/models/Account";

export const Route = createFileRoute("/_app/accounts/$id")({
  component: AccountDetailsPage,
  // loader: async ({ params }) => loader(params.id),
  notFoundComponent: () => {
    return <p>Account not found</p>;
  },
  errorComponent: (error) => {
    console.error("Error loading account", error);
    return (
      <Stack>
        <Text>Error loading account</Text>
        <Text>{`${JSON.stringify(error)}`}</Text>
      </Stack>
    );
  },
});

function AccountDetailsPage() {
  const navigation = useNavigate();

  const { id } = Route.useParams();
  const { account, isLoading } = useAccount(id);

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
    <>
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
        <Group justify="space-between">
          <AccountAvatar accountId={account.id} />

          <Stack
            gap={0}
            style={{
              flexGrow: 1,
            }}
          >
            <Text size="lg" fw={700}>
              {account.name}
            </Text>
            <Text size="sm" c="dimmed">
              {getAccountTypeTitleSingular(account.type)}
            </Text>
          </Stack>

          <AmountLabel
            amount={account.balance.amount}
            currencyCode={account.currency}
          />
        </Group>

        {/* Show info dependent on account type */}
        {AccountDetailsSelector(account)}
        <Space />
        <TransactionsSection accountId={account.id} />

        <Space />

        <Button
          fullWidth
          onClick={() => {
            navigation({ to: `/accounts/$id/edit`, params: { id } });
          }}
        >
          Edit
        </Button>
        <Button fullWidth color="red" onClick={showDeleteAccountModal}>
          Delete
        </Button>
      </Stack>
    </>
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

function TransactionRow({ transaction }: { transaction: TransactionDto }) {
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
