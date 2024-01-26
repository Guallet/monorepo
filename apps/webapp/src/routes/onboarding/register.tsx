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

import { useEffect, useMemo, useState } from "react";
import { UserDto, getUserDetails } from "@user/api/user.api";
import { getCurrentUserId } from "@/core/auth/auth.helper";
import { FileRoute, useNavigate } from "@tanstack/react-router";
import { registerUser } from "@/features/auth/user-register.api";

export const Route = new FileRoute("/onboarding/register").createRoute({
  component: RegisterUserPage,
  loader: loader,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isUserDto(object: any): object is UserDto {
  return "name" in object && "email" in object && "profile_src" in object;
}

type ActionData = {
  rawError: unknown;
  statusCode: number;
  error: string;
  message: string;
};

async function loader() {
  // TODO: Do we need to check if the user is logged in? Or just returns whatever the API returns?
  const userId = await getCurrentUserId();
  if (userId === null) {
    return {
      name: "",
      email: "",
      profile_src: "",
    };
  }

  const user = await getUserDetails();
  return {
    name: user.name,
    email: user.email,
    profile_src: user.profile_src,
  };
}

type FormData = {
  name: string;
  email: string;
  profile_image: string;
};

// const action = async ({ request, params }) => {
//   const formData = await request.formData();
//   const values = Object.fromEntries(formData);
//   // TODO: Ugly as hell, I need to find a better way to do this
//   const inputValues = JSON.parse(JSON.stringify(values)) as FormData;

//   try {
//     const result = await registerUser({
//       name: inputValues.name,
//       email: inputValues.email,
//       profile_src: inputValues.profile_image,
//     });

//     console.log("Registration result", { result });
//     if (isUserDto(result)) {
//       throw redirect({
//         to: "/dashboard",
//       });
//     } else {
//       const errorData = result as unknown as {
//         statusCode: number;
//         message: string;
//         error: string;
//       };

//       return {
//         rawError: result,
//         message: errorData.message,
//         statusCode: errorData.statusCode,
//         error: errorData.error,
//       } as ActionData;
//     }
//   } catch (error) {
//     return { rawError: error } as ActionData;
//   }
// };

function RegisterUserPage() {
  const { name, email, profile_src } = Route.useLoaderData();
  const registrationError = useMemo(() => {
    return {
      rawError: "",
      statusCode: 404,
      error: "",
      message: "",
    } as ActionData;
  }, []);

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
              navigate({ to: "/dashboard", replace: true });
            }}
          >
            Continue to dashboard (not recommended)
          </Button>
          <Button
            onClick={() => {
              navigate({ to: "/logout", replace: true });
            }}
          >
            Try again later
          </Button>
        </Stack>
      </Modal>
      <Stack>
        <Title order={2}>Complete your profile</Title>
        <form method="post" id="add-account-form">
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
                navigate({ to: "/dashboard" });
              }}
            >
              Cancel
            </Button>
          </Group>
        </form>
      </Stack>
    </>
  );
}
