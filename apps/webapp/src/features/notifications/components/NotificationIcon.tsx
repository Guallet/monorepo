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
import { notifications as MantineNotifications } from '@mantine/notifications';
import {
  IconAlertTriangle,
  IconAlertCircle,
  IconHandClick,
  IconInfoCircle,
  IconBell,
} from '@tabler/icons-react';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { isValidRoute } from '@/utils/routeValidation';
import { NotificationItem } from './NotificationItem';

export function NotificationIcon() {
  const { t } = useTranslation();
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

  const handleNotificationClick = async (notification: NotificationDto) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    if (notification.action) {
      const { action } = notification;

      // Validate the action is a valid route using router.buildLocation
      const isDestinationValid = isValidRoute({ to: action });
      console.log('Notification action validation', {
        notificationId: notification.id,
        action,
        isDestinationValid,
      });
      if (isDestinationValid) {
        console.log('Navigating from notification action', {
          notificationId: notification.id,
          action,
        });
        navigate({ to: action });
      } else {
        console.error('Failed to navigate from notification action', {
          notificationId: notification.id,
          action: notification.action,
        });

        MantineNotifications.show({
          title: t(
            'screens.notifications.icon.navigationErrorTitle',
            'Navigation Error',
          ),
          message: t(
            'screens.notifications.icon.navigationErrorMessage',
            'Unable to navigate to the requested page.',
          ),
          color: 'red',
        });
      }
    }
  };

  const renderNotificationContent = () => {
    if (isLoading) {
      return (
        <Text size="sm" c="dimmed" ta="center" py="md">
          {t('screens.notifications.icon.loading', 'Loading...')}
        </Text>
      );
    }

    if (displayNotifications.length === 0) {
      return (
        <Text size="sm" c="dimmed" ta="center" py="md">
          {t(
            'screens.notifications.icon.noNotifications',
            'No new notifications',
          )}
        </Text>
      );
    }

    return (
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
    );
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
              {t('screens.notifications.screen.title', 'Notifications')}
            </Text>
            {hasUnread && (
              <Text size="xs" c="dimmed">
                {t(
                  'screens.notifications.screen.unreadCount',
                  '{{count}} unread',
                  { count: unreadCount },
                )}
              </Text>
            )}
          </Group>
          <Divider />
          {renderNotificationContent()}
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
            {t('screens.notifications.icon.viewAll', 'View all notifications')}
          </Button>
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
}
