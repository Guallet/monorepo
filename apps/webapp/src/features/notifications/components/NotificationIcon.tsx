import { NotificationType, NotificationDto } from '@guallet/api-client';
import {
  useUnreadNotifications,
  useNotificationMutations,
} from '@guallet/api-react';
import {
  Popover,
  UnstyledButton,
  Indicator,
  Center,
  Stack,
  Group,
  Divider,
  Button,
  Text,
} from '@mantine/core';
import {
  IconAlertTriangle,
  IconAlertCircle,
  IconHandClick,
  IconInfoCircle,
  IconBell,
} from '@tabler/icons-react';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { NotificationItem } from './NotificationItem';

export function NotificationIcon() {
  const [opened, setOpened] = useState(false);
  const navigate = useNavigate();
  const { notifications, unreadCount, isLoading } = useUnreadNotifications();
  const { markAsRead } = useNotificationMutations();

  const displayNotifications = notifications.slice(0, 5);
  const hasUnread = unreadCount > 0;

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.WARNING:
        return <IconAlertTriangle size={16} color="orange" />;
      case NotificationType.IMPORTANT:
        return <IconAlertCircle size={16} color="red" />;
      case NotificationType.ACTION_REQUIRED:
        return <IconHandClick size={16} color="blue" />;
      case NotificationType.INFO:
      default:
        return <IconInfoCircle size={16} color="gray" />;
    }
  };

  const handleNotificationClick = (notification: NotificationDto) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    if (notification.action) {
      navigate({ to: notification.action });
    }
  };

  return (
    <Popover
      width={320}
      position="bottom-end"
      withArrow
      shadow="md"
      opened={opened}
      onChange={setOpened}
    >
      <Popover.Target>
        <UnstyledButton onClick={() => setOpened((o) => !o)}>
          <Indicator
            withBorder
            processing={hasUnread}
            color="red"
            disabled={!hasUnread}
          >
            <Center>
              <IconBell />
            </Center>
          </Indicator>
        </UnstyledButton>
      </Popover.Target>
      <Popover.Dropdown>
        <Stack gap="xs">
          <Group justify="space-between">
            <Text fw={600} size="sm">
              Notifications
            </Text>
            {hasUnread && (
              <Text size="xs" c="dimmed">
                {unreadCount} unread
              </Text>
            )}
          </Group>
          <Divider />
          {isLoading ? (
            <Text size="sm" c="dimmed" ta="center" py="md">
              Loading...
            </Text>
          ) : displayNotifications.length === 0 ? (
            <Text size="sm" c="dimmed" ta="center" py="md">
              No new notifications
            </Text>
          ) : (
            <Stack gap="xs">
              {displayNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  getIcon={getNotificationIcon}
                  onClick={() => handleNotificationClick(notification)}
                  onMarkAsRead={() => markAsRead(notification.id)}
                />
              ))}
            </Stack>
          )}
          <Divider />
          <Button
            variant="subtle"
            size="xs"
            fullWidth
            onClick={() => {
              setOpened(false);
              navigate({ to: '/notifications' });
            }}
          >
            View all notifications
          </Button>
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
}
