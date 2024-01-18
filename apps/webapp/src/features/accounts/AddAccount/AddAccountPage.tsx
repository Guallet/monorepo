import { ActionFunction, Form, redirect, useNavigate } from "react-router-dom";
import { TextInput, Button, Group, NativeSelect, rem } from "@mantine/core";
import { IconChevronDown } from "@tabler/icons-react";
import { AppRoutes } from "@/router/AppRoutes";
import {
  CreateAccountRequest,
  createAccount,
} from "@accounts/api/accounts.api";
import { AccountType } from "@accounts/models/Account";
import { useState } from "react";
import { AccountMetadataForm } from "./components/AccountMetadataForm";
import { ISO4217Currencies } from "@guallet/money";

type FormData = {
  name: string;
  currency: string;
  balance: number;
  account_type: AccountType;
};

export const action: ActionFunction = async ({ request, params }) => {
  const formData = await request.formData();
  const values = Object.fromEntries(formData);
  // TODO: Ugly as hell, I need to find a better way to do this
  const inputValues = JSON.parse(JSON.stringify(values)) as FormData;

  const accountRequest: CreateAccountRequest = {
    name: inputValues.name,
    type: inputValues.account_type,
    currency: inputValues.currency,
    initial_balance: inputValues.balance,
  };

  const newAccount = await createAccount(accountRequest);
  return redirect(AppRoutes.Accounts.ACCOUNT_DETAILS(newAccount.id));
};

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

const currencyCodes = Object.values(ISO4217Currencies)
  .map((currency) => {
    return currency.code;
  })
  .sort();
// Remove the first element (antartica)
currencyCodes.shift();

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
    <Form method="post" id="add-account-form">
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
      <NativeSelect
        name="currency"
        label="Account currency"
        description="The currency of the account"
        required
        data={currencyCodes}
        value={currency}
        onChange={(event) => {
          setCurrency(event.currentTarget.value);
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
            navigate(-1);
          }}
        >
          Cancel
        </Button>
      </Group>
    </Form>
  );
}
