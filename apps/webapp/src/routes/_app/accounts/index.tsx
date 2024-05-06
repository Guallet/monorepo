import { AppScreen } from "@/components/Layout/AppScreen";
import { AccountsList } from "@/features/accounts/components/AccountList";
import { AccountsHeader } from "@/features/accounts/components/AccountsHeader";
import { AccountDto } from "@guallet/api-client";
import { useAccounts } from "@guallet/api-react";
import { Button, Group, Space, Stack, Text } from "@mantine/core";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/_app/accounts/")({
  component: AccountsPage,
});

function AccountsPage() {
  const navigation = useNavigate();
  const { accounts, isLoading } = useAccounts();
  const [filteredAccounts, setFilteredAccounts] = useState(accounts);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (searchQuery.length === 0) {
      setFilteredAccounts(accounts);
    } else {
      setFilteredAccounts(
        accounts.filter((x) =>
          x.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }
  }, [accounts, searchQuery]);

  return (
    <AppScreen isLoading={isLoading}>
      {accounts.length === 0 ? (
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
      ) : (
        <Stack>
          <AccountsHeader
            onAddNewAccount={() => navigation({ to: "/accounts/add" })}
            onSearchQueryChanged={(searchQuery: string) => {
              setSearchQuery(searchQuery);
            }}
          />
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
      )}
    </AppScreen>
  );
}

interface EmptyAccountsPageProps {
  onCreateNewAccount: () => void;
  onConnectBank: () => void;
}

function EmptyAccountsPage({
  onCreateNewAccount,
  onConnectBank,
}: Readonly<EmptyAccountsPageProps>) {
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
