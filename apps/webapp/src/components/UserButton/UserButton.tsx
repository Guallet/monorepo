import { UnstyledButton, Group, Avatar, Text, rem } from "@mantine/core";
import classes from "./UserButton.module.css";
import { useAuth } from "@/auth/useAuth";
import { IconChevronRight } from "@tabler/icons-react";

export function UserButton() {
  const { user } = useAuth();
  return (
    <UnstyledButton className={classes.user}>
      <Group>
        <Avatar src={user?.profile_src} radius="xl" />

        <div style={{ flex: 1 }}>
          <Text size="sm" fw={500}>
            {user?.name}
          </Text>

          <Text c="dimmed" size="xs">
            {user?.email}
          </Text>
        </div>

        <IconChevronRight
          style={{ width: rem(14), height: rem(14) }}
          stroke={1.5}
        />
      </Group>
    </UnstyledButton>
  );
}
