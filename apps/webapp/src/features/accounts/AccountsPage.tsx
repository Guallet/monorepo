import { Stack } from "@mantine/core";
import { useLoaderData, useNavigate } from "react-router-dom";
import { loadAccounts } from "./api/accounts.api";
import { AccountsList } from "./components/AccountList";
import { Account } from "./models/Account";
import { AccountsHeader } from "./components/AccountsHeader";

export async function loader() {
  return await loadAccounts();
}

export function AccountsPage() {
  const data = useLoaderData() as Account[];
  const navigation = useNavigate();

  return (
    <>
      <AccountsHeader onAddNewAccount={() => navigation("/accounts/add")} />
      <Stack justify="flex-start">
        <AccountsList accounts={data} />
      </Stack>
    </>
  );
}
