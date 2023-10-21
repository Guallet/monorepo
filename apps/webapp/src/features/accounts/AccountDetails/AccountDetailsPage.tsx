import { Flex, Group, Loader, Modal, Stack, Text, Button } from "@mantine/core";
import { useState } from "react";
import {
  ActionFunctionArgs,
  LoaderFunction,
  ParamParseKey,
  Params,
  useLoaderData,
  useNavigate,
} from "react-router-dom";
import { getAccount, loadAccounts } from "../api/accounts.api";
import { Account } from "../models/Account";
import { CurrentAccountDetails } from "./CurrentAccountDetails";

export const loader: LoaderFunction = async ({ params }) => {
  const { id } = params;
  return await getAccount(id!);
};

export function AccountDetailsPage() {
  const account = useLoaderData() as Account;

  return (
    <>
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
      {/* {account.account_type == "current-account" && (
        <CurrentAccountDetails account={account} />
      )} */}
      <CurrentAccountDetails account={account} />
      <Stack justify="flex-start">
        <Button fullWidth>View Transactions</Button>
        <Button fullWidth disabled>
          Manage connection
        </Button>
        <Button fullWidth>Edit</Button>
        <Button fullWidth color="red">
          Delete
        </Button>
      </Stack>
    </>
  );
}
