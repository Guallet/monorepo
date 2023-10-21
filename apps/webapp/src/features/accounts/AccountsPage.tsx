import { Stack } from "@mantine/core";
import { useLoaderData, useNavigate } from "react-router-dom";
import { loadAccounts } from "./api/accounts.api";
import { AccountsList } from "./components/AccountList";
import { Account } from "./models/Account";
import { AccountsHeader } from "./components/AccountsHeader";
import { useState } from "react";

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
        onAddNewAccount={() => navigation("/accounts/add")}
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
