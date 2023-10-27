import { TextInput, Button, Group, NativeSelect, rem } from "@mantine/core";
import {
  ActionFunction,
  Form,
  LoaderFunction,
  redirect,
  useLoaderData,
  useNavigate,
} from "react-router-dom";
import {
  UpdateAccountRequest,
  getAccount,
  updateAccount,
} from "../api/accounts.api";
import { Account, AccountType } from "../models/Account";
import { IconChevronDown } from "@tabler/icons-react";

type FormData = {
  accountId: string;
  name: string;
  currency: string;
  balance: number;
  account_type: AccountType;
};

export const loader: LoaderFunction = async ({ params }) => {
  const { id } = params;
  return await getAccount(id!);
};

export const action: ActionFunction = async ({ request, params }) => {
  const formData = await request.formData();
  const values = Object.fromEntries(formData);
  // TODO: Ugly as hell, I need to find a better way to do this
  const inputValues = JSON.parse(JSON.stringify(values)) as FormData;
  const accountRequest: UpdateAccountRequest = {
    name: inputValues.name,
    type: inputValues.account_type,
    currency: inputValues.currency,
    initial_balance: inputValues.balance,
  };

  const updatedAccount = await updateAccount(
    inputValues.accountId,
    accountRequest
  );
  return redirect(`/accounts/${updatedAccount.id}`);
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

export function EditAccountPage() {
  const account = useLoaderData() as Account;
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
      <input type="hidden" id="accountId" name="accountId" value={account.id} />
      <NativeSelect
        rightSection={
          <IconChevronDown style={{ width: rem(16), height: rem(16) }} />
        }
        label="Account type"
        data={accountTypes}
        mt="md"
        name="account_type"
        defaultValue={account.type}
      />

      <TextInput
        name="name"
        label="Account name"
        required
        // description="Account name"
        placeholder="Enter account name"
        defaultValue={account.name}
      />

      <TextInput
        name="currency"
        label="Account currency"
        required
        type="text"
        description="The currency of the account"
        defaultValue={account.currency}
      />

      <TextInput
        name="balance"
        label="Account balance"
        required
        description="Initial balance of the account"
        defaultValue={account.balance}
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
