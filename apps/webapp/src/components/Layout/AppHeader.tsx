import { Burger, Group, Title, UnstyledButton } from '@mantine/core';
import { useNavigate } from '@tanstack/react-router';
import { GualletLogo } from '../GualletLogo/GualletLogo';
import { NotificationIcon } from '@/features/notifications/components/NotificationIcon';
import { UserMenuButton } from './UserMenuButton';

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
        <UserMenuButton />
      </Group>
    </Group>
  );
}
