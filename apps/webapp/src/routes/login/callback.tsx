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

const callbackSearchSchema = z.object({
  error: z.string().optional(),
  error_code: z.string().optional(),
  error_description: z.string().optional(),
});

export const Route = createFileRoute('/login/callback')({
  component: LoginCallbackPage,
  validateSearch: callbackSearchSchema,
});

function LoginCallbackPage() {
  const { isLoading: isAuthLoading, isAuthenticated } = useAuth();
  const { error, error_code, error_description } = Route.useSearch();

  // Read the destination redirection from the localstorage
  const redirectTo = localStorage.getItem('redirectDestination') ?? 'dashboard';

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
    return <Navigate to="/login" search={{ redirect: `${redirectTo}` }} />;
  }

  return <Navigate from="/" to={redirectTo} />;
}
