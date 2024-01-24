import { loadAccounts } from "@/features/accounts/api/accounts.api";
import { AccountsList } from "@/features/accounts/components/AccountList";
import { AccountsHeader } from "@/features/accounts/components/AccountsHeader";
import { Account } from "@/features/accounts/models/Account";
import { AppRoutes } from "@/router/AppRoutes";
import { Button, Group, Stack, Text } from "@mantine/core";
import { FileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

export const Route = new FileRoute("/_app/accounts/").createRoute({
  component: AccountsPage,
  loader: loader,
});

async function loader() {
  return await loadAccounts();
}

function AccountsPage() {
  const navigation = useNavigate({ from: "/_app/accounts/" });
  const allAccounts = Route.useLoaderData();
  const [filteredAccounts, setFilteredAccounts] = useState(allAccounts);

  if (allAccounts.length === 0) {
    return (
      <EmptyAccountsPage
        onCreateNewAccount={() => {
          navigation({
            to: "/add",
          });
        }}
        onConnectBank={() => {
          navigation({
            from: "/_app/connect",
            to: AppRoutes.Connections.CONNECT,
          });
        }}
      />
    );
  }

  return (
    <>
      <AccountsHeader
        onAddNewAccount={() =>
          navigation({ to: AppRoutes.Accounts.ACCOUNT_ADD })
        }
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
            navigation({
              to: `/accounts/$accountId`,
              params: { accountId: account.id },
            });
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
