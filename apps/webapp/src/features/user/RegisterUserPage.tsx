import {
  TextInput,
  Button,
  Group,
  NativeSelect,
  rem,
  Stack,
  Title,
  Avatar,
} from "@mantine/core";
import {
  ActionFunction,
  Form,
  LoaderFunction,
  redirect,
  useLoaderData,
  useNavigate,
} from "react-router-dom";
import { AppRoutes } from "../../router/AppRoutes";
import { IconChevronDown } from "@tabler/icons-react";
import { getCurrentUser } from "../../core/auth/auth.helper";
import { User } from "@supabase/supabase-js";

type LoaderData = {
  name: string;
  email: string;
  profile_src: string;
};

export const loader: LoaderFunction = async ({ params, request }) => {
  // TODO: Get the user from the session
  const user = await getCurrentUser();

  if (user === null) {
    return {
      name: "",
      email: "",
      profile_src: "",
    } as LoaderData;
  }

  return {
    name: user.user_metadata.full_name,
    email: user.email,
    profile_src: user.user_metadata.avatar_url,
  } as LoaderData;
};

type FormData = {
  name: string;
  email: string;
  profile_image: string;
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

export function RegisterUserPage() {
  const { name, email, profile_src } = useLoaderData() as LoaderData;
  const navigate = useNavigate();

  return (
    <Stack>
      <Title order={2}>Complete your profile</Title>
      <Form method="post" id="add-account-form">
        {/* <input type="hidden" id="accountId" name="accountId" value={account.id} /> */}

        <Avatar src={profile_src} alt={name} radius="xl" />

        <TextInput
          name="name"
          label="User name"
          required
          // description="Account name"
          placeholder="Enter your name"
          defaultValue={name}
        />

        <TextInput
          name="email"
          label="User email"
          required
          // description="Account name"
          placeholder="Enter your email"
          defaultValue={email}
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
    </Stack>
  );
}
