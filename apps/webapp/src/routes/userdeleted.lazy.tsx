import { useAuth } from "@/core/auth/useAuth";
import { Loader, Stack, Text } from "@mantine/core";
import { Link, createLazyFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createLazyFileRoute("/userdeleted")({
  component: () => DeleteAccountConfirmationPage(),
});

function DeleteAccountConfirmationPage() {
  const { signOut } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    setIsLoading(true);
    signOut()
      .then(() => {})
      .catch(() => {})
      .finally(() => {
        setIsLoading(false);
      });
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
