// {
//     path: "edit",
//     index: true,
//     element: <EditUserPage />,
//     loader: editUserLoader,
//     action: editUserAction,
//   },

import { TextInput, Button, Group } from "@mantine/core";
import { AppRoutes } from "../../../router/AppRoutes";
import { IconChevronDown } from "@tabler/icons-react";
import { FileRoute, useNavigate } from "@tanstack/react-router";
import { getUserDetails } from "@/features/user/api/user.api";

type FormData = {
  name: string;
  email: string;
  profile_image: string;
};

export const Route = new FileRoute("/_app/user/edit").createRoute({
  loader: loader,
  component: EditUserPage,
});

async function loader() {
  const user = await getUserDetails();
  return { user };
}

// TODO: Restore this logic
// const action: ActionFunction = async ({ request, params }) => {
//   const formData = await request.formData();
//   const values = Object.fromEntries(formData);
//   // TODO: Ugly as hell, I need to find a better way to do this
//   const inputValues = JSON.parse(JSON.stringify(values)) as FormData;
//   //   const accountRequest: UpdateAccountRequest = {
//   //     name: inputValues.name,
//   //     type: inputValues.account_type,
//   //     currency: inputValues.currency,
//   //     initial_balance: inputValues.balance,
//   //   };

//   //   const updatedAccount = await updateAccount(
//   //     inputValues.accountId,
//   //     accountRequest
//   //   );
//   //   return redirect(AppRoutes.Accounts.ACCOUNT_DETAILS(updatedAccount.id));
//   return redirect(AppRoutes.User.USER_DETAILS);
// };

function EditUserPage() {
  const { user } = Route.useLoaderData();
  const navigate = useNavigate();

  return (
    <form method="post" id="add-account-form">
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
            navigate({
              to: AppRoutes.User.USER_DETAILS,
            });
          }}
        >
          Cancel
        </Button>
      </Group>
    </form>
  );
}
