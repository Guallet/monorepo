import {
  Burger,
  Center,
  Group,
  Image,
  Indicator,
  Popover,
  Title,
  Tooltip,
  UnstyledButton,
  Text,
} from "@mantine/core";
import logo from "@/assets/guallet.svg";
import { IconBell, IconUser } from "@tabler/icons-react";

interface Props {
  isOpened: boolean;
  onToggle: () => void;
}

export default function AppHeader({ isOpened, onToggle }: Props) {
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
            <Image
              src={logo}
              radius="md"
              h={40}
              w="auto"
              fit="fill"
              alt="Guallet logo"
            />
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
