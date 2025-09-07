import { useAuth } from "@/auth/useAuth";
import { BuildConfig } from "@/build.config";
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
import { useState } from "react";
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
  const { isLoading: isAuthLoading, isAuthenticated } = useAuth();
  const { error, error_code, error_description } = Route.useSearch();
  const [email, setEmail] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Read the destination redirection from the localstorage
  const redirectTo = localStorage.getItem("redirectDestination") ?? "dashboard";

  const onJoinWaitingList = async () => {
    try {
      setIsLoading(true);

      // TODO: Do a proper email validation using zod
      if (!email) {
        alert("Please enter a valid email");
        return;
      }

      const response = await fetch(`${BuildConfig.BASE_API_URL}/waitinglist`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        alert("An error occurred");
        return;
      } else {
        alert("You have been added to the waiting list");
      }
    } catch {
      alert("An error occurred");
      return;
    } finally {
      setIsLoading(false);
    }
  };

  if (isAuthLoading) {
    return (
      <Center>
        <Loader />
      </Center>
    );
  }

  // Handle possible errors
  if (error) {
    return (
      <BaseScreen isLoading={isAuthLoading}>
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
                    value={email}
                    onChange={(e) => setEmail(e.currentTarget.value)}
                    required
                    type="email"
                  />
                  <Button
                    loading={isLoading}
                    disabled={email.length <= 0}
                    onClick={() => {
                      onJoinWaitingList();
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

  if (!isAuthenticated) {
    return <Navigate to="/login" search={{ redirect: `${redirectTo}` }} />;
  }

  return <Navigate from="/" to={redirectTo} />;
}
