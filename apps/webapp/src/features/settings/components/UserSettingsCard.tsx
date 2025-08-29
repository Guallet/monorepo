import { AppSection } from "@/components/Cards/AppSection";
import { useUser } from "@guallet/api-react";
import { Avatar, Button, Group, Stack, Text } from "@mantine/core";

export function UserSettingsCard() {
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
      </Stack>
    </AppSection>
  );
}
