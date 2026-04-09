import { BaseScreen } from '@/components/Screens/BaseScreen';
import { useAuth } from '@guallet/auth';
import {
  Center,
  Loader,
  Text,
  Paper,
  Stack,
  Title,
  Button,
} from '@mantine/core';
import { Link, Navigate, createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

/*
We want to ensure that the redirectTo parameter is a safe internal path to prevent open redirect vulnerabilities.
The regex enforces two rules:

- ^\/(?!\/) — must start with a single / (rules out relative paths and bare hostnames)
- !/^\/\/|^[a-zA-Z][a-zA-Z\d+\-.]*:/ — rejects //host (protocol-relative) and anything with a scheme (http:, https:, javascript:, etc.)

Anything that fails the refine falls back to /dashboard via .catch(), so malformed or malicious values are silently replaced rather than causing a runtime error.

*/
const internalPath = z
  .string()
  .refine(
    (v) => /^\/(?!\/)/.test(v) && !/^\/\/|^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(v),
    {
      message: 'Must be an internal path',
    },
  )
  .catch('/dashboard');

const callbackSearchSchema = z.object({
  error: z.string().optional(),
  error_code: z.string().optional(),
  error_description: z.string().optional(),
  redirectTo: internalPath,
});

export const Route = createFileRoute('/login/callback')({
  component: LoginCallbackPage,
  validateSearch: callbackSearchSchema,
});

function LoginCallbackPage() {
  const { isLoading: isAuthLoading, isAuthenticated } = useAuth();
  const { error, error_code, error_description, redirectTo } =
    Route.useSearch();

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
              <Text>{error_code}</Text>
              <Text>
                {error_description?.replaceAll('+', ' ') ??
                  'An unknown error occurred.'}
              </Text>
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
    return <Navigate to="/login" search={{ redirect: redirectTo }} />;
  }

  return <Navigate from="/" to={redirectTo} />;
}
