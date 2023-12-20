import { TextInput, Button, Group, NativeSelect, rem } from "@mantine/core";
import {
  ActionFunction,
  Form,
  LoaderFunction,
  redirect,
  useLoaderData,
  useNavigate,
} from "react-router-dom";
import { UserDto, getUserDetails } from "./api/user.api";
import { AppRoutes } from "../../router/AppRoutes";
import { IconChevronDown } from "@tabler/icons-react";

type FormData = {
  name: string;
  email: string;
  profile_image: string;
};

type LoaderData = {
  user: UserDto;
};
export const loader: LoaderFunction = async ({ params, request }) => {
  const user = await getUserDetails();

  return {
    user,
  } as LoaderData;
};

export const action: ActionFunction = async ({ request, params }) => {
  const formData = await request.formData();
  const values = Object.fromEntries(formData);
  // TODO: Ugly as hell, I need to find a better way to do this
  const inputValues = JSON.parse(JSON.stringify(values)) as FormData;
  //   const accountRequest: UpdateAccountRequest = {
  //     name: inputValues.name,
  //     type: inputValues.account_type,
  //     currency: inputValues.currency,
  //     initial_balance: inputValues.balance,
  //   };

  //   const updatedAccount = await updateAccount(
  //     inputValues.accountId,
  //     accountRequest
  //   );
  //   return redirect(AppRoutes.Accounts.ACCOUNT_DETAILS(updatedAccount.id));
  return redirect(AppRoutes.User.USER_DETAILS);
};

export function EditUserPage() {
  const { user } = useLoaderData() as LoaderData;
  const navigate = useNavigate();

  return (
    <Form method="post" id="add-account-form">
      {/* <input type="hidden" id="accountId" name="accountId" value={account.id} /> */}

      <TextInput
        name="name"
        label="User name"
        required
        // description="Account name"
        placeholder="Enter your name"
        defaultValue={user.name}
      />

      <TextInput
        name="email"
        label="User email"
        required
        // description="Account name"
        placeholder="Enter your email"
        defaultValue={user.email}
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
