import { AppSection } from "@/components/Cards/AppSection";
import { useUser } from "@guallet/api-react";
import { Avatar, Button, Stack, Text } from "@mantine/core";
import { useNavigate } from "@tanstack/react-router";

export function UserSettingsCard() {
  // TODO: Replace this with a prop callback rather than navigate directly from here
  const navigate = useNavigate();
  const { user } = useUser();

  return (
    <AppSection title="User Information">
      <Stack align="center">
        <Avatar
          src={user?.profile_src}
          alt={user?.name}
          style={{ alignSelf: "center" }}
          size={120}
        />
        <Text>{user?.name}</Text>
        <Text>{user?.email}</Text>
        <Button
          variant="outline"
          color="red"
          onClick={() => {
            navigate({ to: "/logout" });
          }}
        >
          Log out
        </Button>
      </Stack>
    </AppSection>
  );
}
