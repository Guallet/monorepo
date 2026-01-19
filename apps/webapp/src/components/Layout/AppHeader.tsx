import { Burger, Group, Title, Tooltip, UnstyledButton } from '@mantine/core';
import { IconUser } from '@tabler/icons-react';
import { useNavigate } from '@tanstack/react-router';
import { GualletLogo } from '../GualletLogo/GualletLogo';

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { NotificationIcon } from '@/features/notifications/components/NotificationIcon';

dayjs.extend(relativeTime);

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
            navigate({ to: '/dashboard' });
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
