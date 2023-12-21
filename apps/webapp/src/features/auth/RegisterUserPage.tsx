import {
  TextInput,
  Button,
  Group,
  Stack,
  Title,
  Avatar,
  Text,
  Modal,
} from "@mantine/core";
import {
  ActionFunction,
  Form,
  LoaderFunction,
  redirect,
  useActionData,
  useLoaderData,
  useNavigate,
} from "react-router-dom";
import { AppRoutes } from "../../router/AppRoutes";
import { getCurrentUser } from "../../core/auth/auth.helper";
import { registerUser } from "./user-register.api";
import { UserDto } from "../user/api/user.api";
import { useEffect, useState } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isUserDto(object: any): object is UserDto {
  return "name" in object && "email" in object && "profile_src" in object;
}

type LoaderData = {
  name: string;
  email: string;
  profile_src: string;
};

type ActionData = {
  rawError: unknown;
  statusCode: number;
  error: string;
  message: string;
};

export const loader: LoaderFunction = async ({ params, request }) => {
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

  try {
    const result = await registerUser({
      name: inputValues.name,
      email: inputValues.email,
      profile_src: inputValues.profile_image,
    });

    console.log("Registration result", { result });
    if (isUserDto(result)) {
      return redirect(AppRoutes.DASHBOARD);
    } else {
      const errorData = result as unknown as {
        statusCode: number;
        message: string;
        error: string;
      };

      return {
        rawError: result,
        message: errorData.message,
        statusCode: errorData.statusCode,
        error: errorData.error,
      } as ActionData;
    }
  } catch (error) {
    return { rawError: error } as ActionData;
  }
};

export function RegisterUserPage() {
  const { name, email, profile_src } = useLoaderData() as LoaderData;
  const registrationError = useActionData() as ActionData;
  const navigate = useNavigate();

  const [isModalErrorOpen, setIsModalErrorOpen] = useState(false);

  useEffect(() => {
    setIsModalErrorOpen(
      registrationError !== null && registrationError !== undefined
    );
  }, [registrationError]);

  return (
    <>
      <Modal
        opened={isModalErrorOpen}
        onClose={() => {
          setIsModalErrorOpen(false);
        }}
      >
        <Stack>
          <Text>It's not possible to complete the registration:</Text>
          {`${registrationError?.statusCode} - ${registrationError?.message}`}
          {/* // TODO: Handle this case with better options. What should we do here?
          For starters, we should check if the user has permission to create a new account. 
          If not, we should redirect to the logout page.
          */}
          <Button
            onClick={() => {
              navigate(AppRoutes.DASHBOARD, { replace: true });
            }}
          >
            Continue to dashboard (not recommended)
          </Button>
          <Button
            onClick={() => {
              navigate(AppRoutes.Auth.LOGOUT, { replace: true });
            }}
          >
            Try again later
          </Button>
        </Stack>
      </Modal>
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
    </>
  );
}
