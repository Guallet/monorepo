import { TextInput, Button, Group, Stack, Title, Text } from "@mantine/core";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/onboarding/waiting_list")({
  component: SubscribeWaitingListPage,
  loader: loader,
});

type ActionData = {
  rawError: unknown;
  statusCode: number;
  error: string;
  message: string;
};

function loader() {
  return {
    name: "",
    email: "",
  };
}

type FormData = {
  name: string;
  email: string;
};

// export const action: ActionFunction = async ({ request, params }) => {
//   const formData = await request.formData();
//   const values = Object.fromEntries(formData);
//   // TODO: Ugly as hell, I need to find a better way to do this
//   const inputValues = JSON.parse(JSON.stringify(values)) as FormData;

//   return {
//     error: "",
//     message: "",
//     rawError: null,
//     statusCode: 200,
//   } as ActionData;
// };

function SubscribeWaitingListPage() {
  const { name, email } = Route.useLoaderData();
  const navigate = useNavigate();

  return (
    <Stack>
      <Title order={2}>You need an invitation to use the app</Title>
      <form method="post" id="add-account-form">
        <Text>
          Enter your email and name to be one of the first to try the app
        </Text>
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
              navigate({ to: "/logout", replace: true });
            }}
          >
            Cancel
          </Button>
        </Group>
      </form>
    </Stack>
  );
}
