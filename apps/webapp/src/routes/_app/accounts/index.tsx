import EmptyState from "@/components/EmptyState/EmptyState";
import { BaseScreen } from "@/components/Screens/BaseScreen";
import { AccountsList } from "@/features/accounts/components/AccountList";
import { AccountsHeader } from "@/features/accounts/components/AccountsHeader";
import { AccountDto } from "@guallet/api-client";
import { useAccounts } from "@guallet/api-react";
import { Space, Stack } from "@mantine/core";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/_app/accounts/")({
  component: AccountsPage,
});

function AccountsPage() {
  const { t } = useTranslation();
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
    <BaseScreen isLoading={isLoading}>
      {accounts.length === 0 ? (
        <EmptyState
          iconName="IconCreditCard"
          text={t(
            "screens.accounts.list.emptyState.text",
            "CNF: Create your first account"
          )}
          onClick={() => {
            navigation({
              to: "/accounts/new",
            });
          }}
        />
      ) : (
        <Stack p={"md"}>
          <AccountsHeader
            onAddNewAccount={() => navigation({ to: "/accounts/new" })}
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
    </BaseScreen>
  );
}
