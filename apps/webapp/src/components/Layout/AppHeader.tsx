import {
  Burger,
  Center,
  Group,
  Indicator,
  Popover,
  Title,
  Tooltip,
  UnstyledButton,
  Text,
} from "@mantine/core";
import { IconBell, IconUser } from "@tabler/icons-react";
import { useNavigate } from "@tanstack/react-router";
import { GualletLogo } from "../GualletLogo/GualletLogo";

interface Props {
  isOpened: boolean;
  onToggle: () => void;
}

export default function AppHeader({ isOpened, onToggle }: Readonly<Props>) {
  const navigate = useNavigate();

  return (
    <Group h="100%" px="md" justify="space-between">
      <Group>
        <Burger
          opened={isOpened}
          onClick={onToggle}
          hiddenFrom="sm"
          size="sm"
        />
        <UnstyledButton
          variant="transparent"
          onClick={() => {
            navigate({ to: "/dashboard" });
          }}
        >
          <Group>
            <GualletLogo size={40} />
            <Title order={2}>Guallet</Title>
          </Group>
        </UnstyledButton>
      </Group>

      <Group>
        <NotificationIcon />
        <Tooltip label="User">
          <IconUser />
        </Tooltip>
      </Group>
    </Group>
  );
}

function NotificationIcon() {
  return (
    <Popover width={200} position="bottom" withArrow shadow="md">
      <Popover.Target>
        {/* <Tooltip label="Notifications"> */}
        <Indicator withBorder processing color="red" disabled={false}>
          <Center>
            <IconBell />
          </Center>
        </Indicator>
        {/* </Tooltip> */}
      </Popover.Target>
      <Popover.Dropdown>
        <Text size="xs">
          This is uncontrolled popover, it is opened when button is clicked
        </Text>
      </Popover.Dropdown>
    </Popover>
  );
}
