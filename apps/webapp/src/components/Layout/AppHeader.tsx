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
import { GualletLogo } from "../GualletLogo/GualletLogo";

interface Props {
  isOpened: boolean;
  onToggle: () => void;
}

export default function AppHeader({ isOpened, onToggle }: Readonly<Props>) {
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
          component="a"
          variant="transparent"
          href={"/"}
          onClick={(event) => event.preventDefault()}
        >
          <Group>
            <GualletLogo />
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
