import { Group, Modal, Stack, Text, Button } from "@mantine/core";
import {
  LoaderFunction,
  useLoaderData,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { CurrentAccountDetails } from "./CurrentAccountDetails";
import { fetch_delete } from "@core/api/fetchHelper";
import { AppRoutes } from "@router/AppRoutes";
import { Account, AccountType } from "@accounts/models/Account";
import { getAccount } from "@accounts/api/accounts.api";
import { CreditCardDetails } from "./CreditCardDetails";

const DELETE_ACCOUNT_MODAL_QUERY = "delete";

export const loader: LoaderFunction = async ({ params }) => {
  const { id } = params;
  return await getAccount(id!);
};

export function AccountDetailsPage() {
  const navigation = useNavigate();
  const account = useLoaderData() as Account;

  const [searchParams, setSearchParams] = useSearchParams();
  const isDeleteAccountModalOpen =
    searchParams.get(DELETE_ACCOUNT_MODAL_QUERY) === "true";

  function showDeleteAccountModal() {
    setSearchParams((params) => {
      params.append(DELETE_ACCOUNT_MODAL_QUERY, "true");
      return params;
    });
  }

  function hideModal() {
    setSearchParams((params) => {
      params.delete(DELETE_ACCOUNT_MODAL_QUERY);
      return params;
    });
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
            navigation(AppRoutes.Accounts.ACCOUNTS, { replace: true });
          }}
        />
      </Modal>
      {/* <AccountsHeader
        onAddNewAccount={() => setIsAddAccountModalOpened(true)}
      />
      <Stack justify="flex-start">
        <AccountsList accounts={data} />
      </Stack> */}
      <Text size="lg" fw={700}>
        {account.name}
      </Text>

      {/* Show info dependent on account type */}
      {AccountDetailsSelector(account)}

      <Stack justify="flex-start">
        <Button fullWidth>View Transactions</Button>
        <Button fullWidth disabled>
          Manage connection
        </Button>
        <Button component="a" fullWidth href={`/accounts/${account.id}/edit`}>
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
  account: Account;
  onCancel: () => void;
  onAccountDeleted: () => void;
}
function DeleteAccountDialog({
  account,
  onCancel,
  onAccountDeleted,
}: DialogProps) {
  async function deleteAccount() {
    const deleted = await fetch_delete(`accounts/${account.id}`);
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

function AccountDetailsSelector(account: Account) {
  // TODO: Create different components for each account type
  switch (account.type) {
    case AccountType.CURRENT_ACCOUNT:
      return <CurrentAccountDetails account={account} />;
    case AccountType.CREDIT_CARD:
      return <CreditCardDetails account={account} />;
    default:
      return null;
  }
}
