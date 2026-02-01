import {
  TextInput,
  Button,
  Group,
  Stack,
  Title,
  Avatar,
  Text,
  Modal,
} from '@mantine/core';

import { useMemo } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useUser } from '@guallet/api-react';
import { useAuth } from '@guallet/auth';

export const Route = createFileRoute('/onboarding/register')({
  component: RegisterUserPage,
});

function RegisterUserPage() {
  const { isAuthenticated } = useAuth();
  const { user, isLoading: userLoading } = useUser();
  const navigate = useNavigate();

  const registrationError = useMemo(() => {
    return {
      rawError: '',
      statusCode: 404,
      error: '',
      message: '',
    };
  }, []);

  const isModalErrorOpen = useMemo(
    () => registrationError !== null && registrationError !== undefined,
    [registrationError],
  );

  // Handle loading state
  if (userLoading) {
    return <Text>Loading...</Text>;
  }

  // Handle unauthenticated users
  if (!isAuthenticated) {
    return (
      <Stack>
        <Text>Please log in to complete your profile.</Text>
        <Button
          onClick={() => {
            navigate({
              to: '/login',
              search: { redirect: '/dashboard' },
            });
          }}
        >
          Go to Login
        </Button>
      </Stack>
    );
  }

  // Default values for the form
  const defaultName = user?.name || '';
  const defaultEmail = user?.email || '';
  const defaultProfileSrc = user?.profile_src || '';

  return (
    <>
      <Modal
        opened={isModalErrorOpen}
        onClose={() => {
          // Close modal - error state will reset on retry
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
              navigate({ to: '/dashboard', replace: true });
            }}
          >
            Continue to dashboard (not recommended)
          </Button>
          <Button
            onClick={() => {
              navigate({ to: '/logout', replace: true });
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

          <Avatar src={defaultProfileSrc} alt={defaultName} radius="xl" />

          <TextInput
            name="name"
            label="User name"
            required
            // description="Account name"
            placeholder="Enter your name"
            defaultValue={defaultName}
          />

          <TextInput
            name="email"
            label="User email"
            required
            // description="Account name"
            placeholder="Enter your email"
            defaultValue={defaultEmail}
          />

          <Group>
            <Button type="submit">Save</Button>
            <Button
              variant="outline"
              onClick={() => {
                // Go back
                navigate({ to: '/dashboard' });
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
