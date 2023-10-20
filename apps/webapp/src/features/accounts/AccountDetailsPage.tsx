import { Flex, Group, Loader, Modal, Stack, Text } from "@mantine/core";
import { useState } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";
import { loadAccounts } from "./api/accounts.api";

export async function loader() {
  return (await loadAccounts())[0];
}

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
