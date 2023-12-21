import { Stack } from "@mantine/core";
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
