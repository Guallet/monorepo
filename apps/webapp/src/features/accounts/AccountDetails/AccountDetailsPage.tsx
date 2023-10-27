import { Flex, Group, Loader, Modal, Stack, Text, Button } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useState } from "react";
import {
  ActionFunctionArgs,
  LoaderFunction,
  ParamParseKey,
  Params,
  useLoaderData,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { getAccount, loadAccounts } from "../api/accounts.api";
import { Account } from "../models/Account";
import { CurrentAccountDetails } from "./CurrentAccountDetails";
import { fetch_delete } from "../../../core/api/fetchHelper";

const DELETE_ACCOUNT_MODAL_QUERY = "delete";

export const loader: LoaderFunction = async ({ params }) => {
  const { id } = params;
  return await getAccount(id!);
};

export function AccountDetailsPage() {
  const navigation = useNavigate();
  const account = useLoaderData() as Account;

  let [searchParams, setSearchParams] = useSearchParams();
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
          onAccountDeleted={() => {
            navigation("/accounts", { replace: true });
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
      // TODO: Create different components for each account type
      {/* <Text>{JSON.stringify(account)}</Text> */}
      {/* <Text>Mortgage options?</Text>
      <Text>Loan options?</Text>
      <Text>Saving account options?</Text> */}
      {/* {account.type == "current-account" && (
        <CurrentAccountDetails account={account} />
      )} */}
      <CurrentAccountDetails account={account} />
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
  onAccountDeleted: () => void;
}
function DeleteAccountDialog({ account, onAccountDeleted }: DialogProps) {
  async function deleteAccount() {
    const deleted = await fetch_delete(`accounts/${account.id}`);
    onAccountDeleted();
  }

  return (
    <Stack>
      <Text>Are you sure you want to delete the account?</Text>
      <Text size="sm"> This action and cannot be undone.</Text>
      <Group justify="flex-end">
        <Button>Cancel</Button>
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
