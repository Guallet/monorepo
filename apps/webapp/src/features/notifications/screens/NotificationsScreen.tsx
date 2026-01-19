import {
  Stack,
  Title,
  Text,
  Group,
  Button,
  Paper,
  Badge,
  Divider,
} from '@mantine/core';
import { IconChecks } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { BaseScreen } from '@/components/Screens/BaseScreen';
import { useNotifications, useNotificationMutations } from '@guallet/api-react';
import { NotificationDto } from '@guallet/api-client';
import { useNavigate } from '@tanstack/react-router';
import { NotificationRow } from '../components/NotificationRow';

export function NotificationsScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { notifications, isLoading } = useNotifications();
  const {
    markAsRead,
    markAsUnread,
    markAllAsRead,
    deleteNotification,
    isUpdating,
    isDeleting,
  } = useNotificationMutations();

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleNotificationClick = (notification: NotificationDto) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    if (notification.action) {
      navigate({ to: notification.action });
    }
  };

  if (isLoading) {
    return (
      <BaseScreen>
        <Stack>
          <Title>
            {t('screens.notifications.screen.title', 'Notifications')}
          </Title>
          <Text c="dimmed">
            {t(
              'screens.notifications.screen.loading',
              'Loading notifications...',
            )}
          </Text>
        </Stack>
      </BaseScreen>
    );
  }

  return (
    <BaseScreen>
      <Stack>
        <Group justify="space-between" align="center">
          <Group>
            <Title>
              {t('screens.notifications.screen.title', 'Notifications')}
            </Title>
            {unreadCount > 0 && (
              <Badge color="red" size="lg">
                {t(
                  'screens.notifications.screen.unreadCount',
                  '{{count}} unread',
                  { count: unreadCount },
                )}
              </Badge>
            )}
          </Group>
          {unreadCount > 0 && (
            <Button
              leftSection={<IconChecks size={16} />}
              variant="subtle"
              onClick={() => markAllAsRead()}
              loading={isUpdating}
            >
              {t(
                'screens.notifications.screen.markAllAsRead',
                'Mark all as read',
              )}
            </Button>
          )}
        </Group>

        <Divider />

        {notifications.length === 0 ? (
          <Paper p="xl" withBorder>
            <Text c="dimmed" ta="center">
              {t(
                'screens.notifications.screen.emptyState',
                'You have no notifications',
              )}
            </Text>
          </Paper>
        ) : (
          <Stack gap="sm">
            {notifications.map((notification) => (
              <NotificationRow
                key={notification.id}
                notification={notification}
                onClick={handleNotificationClick}
                onMarkAsRead={markAsRead}
                onMarkAsUnread={markAsUnread}
                onDelete={deleteNotification}
                isUpdating={isUpdating}
                isDeleting={isDeleting}
              />
            ))}
          </Stack>
        )}
      </Stack>
    </BaseScreen>
  );
}
