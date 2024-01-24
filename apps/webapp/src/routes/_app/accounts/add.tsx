import { TextInput, Button, Group, NativeSelect, rem } from "@mantine/core";
import { IconChevronDown } from "@tabler/icons-react";
import { AccountType } from "@accounts/models/Account";
import { useState } from "react";
import { CurrencyPicker } from "@/components/CurrencyPicker/CurrencyPicker";

import { FileRoute, useNavigate } from "@tanstack/react-router";
import { AccountMetadataForm } from "@/features/accounts/AddAccount/components/AccountMetadataForm";

export const Route = new FileRoute("/_app/accounts/add").createRoute({
  component: AddAccountPage,
});

type FormData = {
  name: string;
  currency: string;
  balance: number;
  account_type: AccountType;
};

// export const action: ActionFunction = async ({ request, params }) => {
//   const formData = await request.formData();
//   const values = Object.fromEntries(formData);
//   // TODO: Ugly as hell, I need to find a better way to do this
//   const inputValues = JSON.parse(JSON.stringify(values)) as FormData;

//   const accountRequest: CreateAccountRequest = {
//     name: inputValues.name,
//     type: inputValues.account_type,
//     currency: inputValues.currency,
//     initial_balance: inputValues.balance,
//   };

//   const newAccount = await createAccount(accountRequest);
//   return redirect(AppRoutes.Accounts.ACCOUNT_DETAILS(newAccount.id));
// };

function getLocalizedType(name: AccountType): string {
  // TODO: Localize this
  switch (name) {
    case AccountType.CREDIT_CARD:
      return "Credit Card";
    case AccountType.CURRENT_ACCOUNT:
      return "Current account";
    case AccountType.INVESTMENT:
      return "Investment";
    case AccountType.LOAN:
      return "Loan";
    case AccountType.MORTGAGE:
      return "Mortgage";
    case AccountType.PENSION:
      return "Pension";
    case AccountType.SAVINGS:
      return "Savings account";
    case AccountType.UNKNOWN:
      return "Other";
    default:
      return "Other";
  }
}

export function AddAccountPage() {
  const navigate = useNavigate();

  const [accountType, setAccountType] = useState<AccountType | null>(null);
  const [currency, setCurrency] = useState("GBP"); // Get the default currency from the user settings

  const accountTypes = Object.entries(AccountType).map(
    ({ "0": name, "1": accountType }) => {
      return {
        label: getLocalizedType(accountType),
        value: accountType,
      };
    }
  );

  return (
    <form method="post" id="add-account-form">
      <TextInput
        name="name"
        label="Account name"
        required
        placeholder="Enter account name"
      />

      <NativeSelect
        required
        rightSection={
          <IconChevronDown style={{ width: rem(16), height: rem(16) }} />
        }
        label="Account type"
        data={accountTypes}
        mt="md"
        name="account_type"
        value={accountType ?? ""}
        onChange={(event) => {
          setAccountType(event.currentTarget.value as AccountType);
        }}
      />
      <CurrencyPicker
        name="currency"
        required
        value={currency}
        onValueChanged={(newValue) => {
          setCurrency(newValue);
        }}
      />

      <TextInput
        name="balance"
        label="Initial balance"
        required
        description="Initial balance of the account"
        defaultValue={0}
        type="number"
        leftSection={"£"}
      />
      {accountType && <AccountMetadataForm accountType={accountType} />}

      <Group>
        <Button type="submit">Save</Button>
        <Button
          variant="outline"
          onClick={() => {
            // Go back
            navigate({ to: "/accounts" });
          }}
        >
          Cancel
        </Button>
      </Group>
    </form>
  );
}
