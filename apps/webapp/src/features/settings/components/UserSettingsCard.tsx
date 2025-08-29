import { AppSection } from "@/components/Cards/AppSection";
import { useUser } from "@guallet/api-react";
import { Avatar, Button, Group, Stack, Text } from "@mantine/core";
import { useNavigate } from "@tanstack/react-router";

export function UserSettingsCard() {
  // TODO: Replace this with a prop callback rather than navigate directly from here
  const navigate = useNavigate();
  const { user } = useUser();

  return (
    <AppSection title="User Information">
      <Stack>
        <Avatar
          src={user?.profile_src}
          alt={user?.name}
          style={{ alignSelf: "center" }}
        />
        <Group>
          <Text>Name</Text>
          <Text>{user?.name}</Text>
        </Group>

        <Group>
          <Text>Email</Text>
          <Text>{user?.email}</Text>
        </Group>
        <Button
          onClick={() => {
            console.log("Edit user");
          }}
        >
          Edit
        </Button>
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
