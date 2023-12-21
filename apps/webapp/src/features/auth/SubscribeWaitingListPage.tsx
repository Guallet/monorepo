import { AppRoutes } from "@router/AppRoutes";
import { TextInput, Button, Group, Stack, Title, Text } from "@mantine/core";
import {
  ActionFunction,
  Form,
  LoaderFunction,
  useActionData,
  useLoaderData,
  useNavigate,
} from "react-router-dom";

type LoaderData = {
  name: string;
  email: string;
};

type ActionData = {
  rawError: unknown;
  statusCode: number;
  error: string;
  message: string;
};

export const loader: LoaderFunction = async ({ params, request }) => {
  return {
    name: "",
    email: "",
  } as LoaderData;
};

type FormData = {
  name: string;
  email: string;
};

export const action: ActionFunction = async ({ request, params }) => {
  const formData = await request.formData();
  const values = Object.fromEntries(formData);
  // TODO: Ugly as hell, I need to find a better way to do this
  const inputValues = JSON.parse(JSON.stringify(values)) as FormData;

  return {
    error: "",
    message: "",
    rawError: null,
    statusCode: 200,
  } as ActionData;
};

export function SubscribeWaitingListPage() {
  const { name, email } = useLoaderData() as LoaderData;
  const actionData = useActionData() as ActionData;
  const navigate = useNavigate();

  return (
    <Stack>
      <Title order={2}>You need an invitation to use the app</Title>
      <Form method="post" id="add-account-form">
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
              navigate(AppRoutes.Auth.LOGOUT, { replace: true });
            }}
          >
            Cancel
          </Button>
        </Group>
      </Form>
    </Stack>
  );
}
