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
    account_type: "",
    currency: inputValues.currency,
    initial_balance: inputValues.balance,
  };

  const updatedAccount = await updateAccount(accountRequest);
  return redirect(`/accounts/${updatedAccount.id}`);
};

export function EditAccountPage() {
  const account = useLoaderData() as Account;
  const navigate = useNavigate();

  return (
    <Form method="post" id="add-account-form">
      <NativeSelect
        rightSection={
          <IconChevronDown style={{ width: rem(16), height: rem(16) }} />
        }
        label="Account type"
        data={Object.keys(AccountType)}
        mt="md"
        name="account_type"
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
