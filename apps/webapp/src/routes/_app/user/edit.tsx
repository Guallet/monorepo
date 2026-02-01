import { useUser } from '@guallet/api-react';
import { TextInput, Button, Group } from '@mantine/core';
import { createFileRoute, useNavigate } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/user/edit')({
  component: EditUserPage,
});

function EditUserPage() {
  const { user } = useUser();
  const navigate = useNavigate();

  return (
    <form method="post" id="add-account-form">
      {/* <input type="hidden" id="accountId" name="accountId" value={account.id} /> */}

      <TextInput
        name="name"
        label="User name"
        required
        // description="Account name"
        placeholder="Enter your name"
        defaultValue={user?.name}
      />

      <TextInput
        name="email"
        label="User email"
        required
        // description="Account name"
        placeholder="Enter your email"
        defaultValue={user?.email}
      />

      <Group>
        <Button type="submit">Save</Button>
        <Button
          variant="outline"
          onClick={() => {
            navigate({
              to: '/user',
            });
          }}
        >
          Cancel
        </Button>
      </Group>
    </form>
  );
}
