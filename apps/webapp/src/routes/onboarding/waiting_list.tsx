import { TextInput, Button, Group, Stack, Title, Text } from '@mantine/core';
import { createFileRoute, useNavigate } from '@tanstack/react-router';

export const Route = createFileRoute('/onboarding/waiting_list')({
  component: SubscribeWaitingListPage,
});

function SubscribeWaitingListPage() {
  const { name, email } = { name: '', email: '' }; // Placeholder for user data
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
              navigate({ to: '/logout', replace: true });
            }}
          >
            Cancel
          </Button>
        </Group>
      </form>
    </Stack>
  );
}
