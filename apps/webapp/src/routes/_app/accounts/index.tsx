import { useAccounts } from "@/core/api/accounts/useAccounts";
import { AccountsList } from "@/features/accounts/components/AccountList";
import { AccountsHeader } from "@/features/accounts/components/AccountsHeader";
import { AccountDto } from "@guallet/api-client";
import { Button, Group, Stack, Text } from "@mantine/core";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/_app/accounts/")({
  component: AccountsPage,
});

function AccountsPage() {
  const navigation = useNavigate();
  const { accounts } = useAccounts();
  const [filteredAccounts, setFilteredAccounts] = useState(accounts);

  useEffect(() => {
    setFilteredAccounts(accounts);
  }, [accounts]);

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
    <>
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
      <Stack justify="flex-start">
        <AccountsList
          accounts={filteredAccounts}
          onAccountSelected={(account: AccountDto) => {
            navigation({
              to: "/accounts/$id",
              params: { id: account.id },
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
