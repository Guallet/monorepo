import { UnstyledButton, Group, Avatar, Text, rem } from "@mantine/core";
import { IconChevronRight } from "@tabler/icons-react";
import classes from "./UserButton.module.css";
import { getCurrentUser } from "../../core/auth/auth.helper";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";

export function UserButton() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    getCurrentUser().then((user) => {
      setUser(user);
    });
  }, []);

  return (
    <UnstyledButton className={classes.user}>
      <Group>
        <Avatar src={user?.user_metadata.avatar_url} radius="xl" />

        <div style={{ flex: 1 }}>
          <Text size="sm" fw={500}>
            {user?.user_metadata.full_name}
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
