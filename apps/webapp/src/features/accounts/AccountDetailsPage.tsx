import { Flex, Group, Loader, Modal, Stack, Text } from "@mantine/core";
import { useState } from "react";
import {
  ActionFunctionArgs,
  LoaderFunction,
  ParamParseKey,
  Params,
  useLoaderData,
  useNavigate,
} from "react-router-dom";
import { getAccount, loadAccounts } from "./api/accounts.api";

export const loader: LoaderFunction = async ({ params }) => {
  const { id } = params;
  return await getAccount(id!);
};

export function AccountDetailsPage() {
  const data = useLoaderData();

  return (
    <>
      {/* <AccountsHeader
        onAddNewAccount={() => setIsAddAccountModalOpened(true)}
      />
      <Stack justify="flex-start">
        <AccountsList accounts={data} />
      </Stack> */}

      <Text size="lg" fw={700}>
        Account details
      </Text>
      <Text>{JSON.stringify(data)}</Text>
    </>
  );
}
