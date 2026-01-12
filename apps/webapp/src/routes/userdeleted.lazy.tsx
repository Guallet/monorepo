import { useAuth } from '@guallet/auth';
import { Loader, Stack, Text } from '@mantine/core';
import { Link, createLazyFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

export const Route = createLazyFileRoute('/userdeleted')({
  component: () => DeleteAccountConfirmationPage(),
});

function DeleteAccountConfirmationPage() {
  const { logout } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    logout()
      .then(() => {})
      .catch(() => {})
      .finally(() => {
        setIsLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) {
    return (
      <Stack>
        <Loader />
        <Text>Deleting your data...</Text>
      </Stack>
    );
  }

  return (
    <Stack>
      <Text>Your account and all your data has been deleted</Text>
      <Link to="/">Go to home page</Link>
    </Stack>
  );
}
