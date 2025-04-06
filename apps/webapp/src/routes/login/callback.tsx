import { useAuth } from "@/auth/useAuth";
import { BaseScreen } from "@/components/Screens/BaseScreen";
import {
  Center,
  Loader,
  Text,
  Paper,
  Stack,
  Title,
  Button,
  TextInput,
} from "@mantine/core";
import { Link, Navigate, createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const callbackSearchSchema = z.object({
  error: z.string().optional(),
  error_code: z.string().optional(),
  error_description: z.string().optional(),
});

export const Route = createFileRoute("/login/callback")({
  component: LoginCallbackPage,
  validateSearch: callbackSearchSchema,
});

function LoginCallbackPage() {
  const { isLoading, isAuthenticated } = useAuth();
  const { error, error_code, error_description } = Route.useSearch();

  // Read the destination redirection from the localstorage
  const redirectTo = localStorage.getItem("redirectDestination") ?? "dashboard";

  // Handle possible errors
  if (error) {
    return (
      <BaseScreen isLoading={isLoading}>
        <Stack justify="center" align="center" h="100%">
          <Paper withBorder shadow="md" p={30} mt={20} radius="md">
            <Stack>
              <Title>Authentication error</Title>
              {error_code === "signup_disabled" ? (
                <>
                  <Text>
                    This is a invitation only app. Please join the waiting list
                    if you want to access it.
                  </Text>
                  <TextInput
                    label="Email"
                    placeholder="your@email.com"
                    description="We will send you an invitation when we are ready"
                  />
                  <Button
                    onClick={() => {
                      alert(
                        "Sorry! This feature has not been implemented yet, but you can send us an email to add you to the waiting list manually"
                      );
                    }}
                  >
                    Join the waiting list
                  </Button>
                </>
              ) : (
                <Text>
                  {error_description?.replace(/\+/g, " ") ??
                    "An unknown error occurred."}
                </Text>
              )}
              <Button component={Link} to="/login">
                Go back to login screen
              </Button>
            </Stack>
          </Paper>
        </Stack>
      </BaseScreen>
    );
  }

  if (isLoading) {
    return (
      <Center>
        <Loader />
      </Center>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" search={{ redirect: `${redirectTo}` }} />;
  }

  return <Navigate from="/" to={redirectTo} />;
}
