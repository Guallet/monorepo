import { ActionFunction, Form, redirect, useNavigate } from "react-router-dom";
import { CreateAccountRequest, createAccount } from "../api/accounts.api";
import { TextInput, Button, Group, NativeSelect, rem } from "@mantine/core";
import { IconChevronDown } from "@tabler/icons-react";
import { AccountType } from "../models/Account";

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
  return redirect(`/accounts/${newAccount.id}`);
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

export function AddAccountPage() {
  const navigate = useNavigate();

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
      <NativeSelect
        rightSection={
          <IconChevronDown style={{ width: rem(16), height: rem(16) }} />
        }
        label="Account type"
        data={accountTypes}
        mt="md"
        name="account_type"
      />

      <TextInput
        name="name"
        label="Account name"
        required
        placeholder="Enter account name"
      />

      <TextInput
        name="currency"
        label="Account currency"
        required
        type="text"
        description="The currency of the account"
        defaultValue={"GBP"} // Get this from the user settings
      />

      <TextInput
        name="balance"
        label="Account balance"
        required
        description="Initial balance of the account"
        defaultValue={0}
        type="number"
        leftSection={"£"}
      />
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
