import { AccountsList } from "@/features/accounts/components/AccountList";
import { AccountsHeader } from "@/features/accounts/components/AccountsHeader";
import { AccountDto } from "@guallet/api-client";
import { useAccounts } from "@guallet/api-react";
import { Button, Group, Loader, Space, Stack, Text } from "@mantine/core";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/_app/accounts/")({
  component: AccountsPage,
});

function AccountsPage() {
  const navigation = useNavigate();
  const { accounts, isLoading } = useAccounts();
  const [filteredAccounts, setFilteredAccounts] = useState(accounts);

  useEffect(() => {
    setFilteredAccounts(accounts);
  }, [accounts]);

  if (isLoading) {
    return <Loader />;
  }

  if (accounts.length === 0) {
    return (
      <EmptyAccountsPage
        onCreateNewAccount={() => {
          navigation({
            to: "/accounts/add",
          });
        }}
        onConnectBank={() => {
          navigation({
            to: "/connections/connect",
          });
        }}
      />
    );
  }

  return (
    <Stack>
      <AccountsHeader
        onAddNewAccount={() => navigation({ to: "/accounts/add" })}
        onSearchQueryChanged={(searchQuery: string) => {
          if (searchQuery.length === 0) {
            setFilteredAccounts(accounts);
          } else {
            setFilteredAccounts(
              accounts.filter((x) =>
                x.name.toLowerCase().includes(searchQuery.toLowerCase())
              )
            );
          }
        }}
      />
      <Space h="md" />
      <AccountsList
        accounts={filteredAccounts}
        onAccountSelected={(account: AccountDto) => {
          navigation({
            to: "/accounts/$id",
            params: { id: account.id },
          });
        }}
      />
      <Space h="md" />
    </Stack>
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
