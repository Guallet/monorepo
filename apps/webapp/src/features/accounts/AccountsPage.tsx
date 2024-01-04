import { Button, Group, Stack, Text } from "@mantine/core";
import { useLoaderData, useNavigate } from "react-router-dom";
import { loadAccounts } from "./api/accounts.api";
import { AccountsHeader } from "./components/AccountsHeader";
import { useState } from "react";
import { Account } from "@accounts/models/Account";
import { AccountsList } from "./components/AccountList";
import { AppRoutes } from "@router/AppRoutes";

export async function loader() {
  return await loadAccounts();
}

export function AccountsPage() {
  const navigation = useNavigate();
  const allAccounts = useLoaderData() as Account[];
  const [filteredAccounts, setFilteredAccounts] = useState(allAccounts);

  if (allAccounts.length === 0) {
    return (
      <EmptyAccountsPage
        onCreateNewAccount={() => {
          navigation(AppRoutes.Accounts.ACCOUNT_ADD);
        }}
        onConnectBank={() => {
          navigation(AppRoutes.Connections.CONNECT);
        }}
      />
    );
  }

  return (
    <>
      <AccountsHeader
        onAddNewAccount={() => navigation(AppRoutes.Accounts.ACCOUNT_ADD)}
        onSearchQueryChanged={(searchQuery: string) => {
          if (searchQuery.length === 0) {
            setFilteredAccounts(allAccounts);
          } else {
            setFilteredAccounts(
              allAccounts.filter((x) =>
                x.name.toLowerCase().includes(searchQuery.toLowerCase())
              )
            );
          }
        }}
      />
      <Stack justify="flex-start">
        <AccountsList
          accounts={filteredAccounts}
          onAccountSelected={(account: Account) => {
            navigation(`/accounts/${account.id}`);
          }}
        />
      </Stack>
    </>
  );
}

interface EmptyAccountsPageProps {
  onCreateNewAccount: () => void;
  onConnectBank: () => void;
}

function EmptyAccountsPage({
  onCreateNewAccount,
  onConnectBank,
}: EmptyAccountsPageProps) {
  return (
    <Stack>
      <Text>It looks you don't have any account yet</Text>
      <Text>Create a new manual account or connect with your bank</Text>
      <Group justify="center">
        <Button onClick={onCreateNewAccount}>Create new account</Button>
        <Button onClick={onConnectBank}>Connect your bank</Button>
      </Group>
    </Stack>
  );
}
