import { useAuth } from "@/core/auth/useAuth";
import { Loader, Stack, Text } from "@mantine/core";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export function DeleteAccountConfirmationPage() {
  const { signOut } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    signOut()
      .then(() => {})
      .catch(() => {});
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
