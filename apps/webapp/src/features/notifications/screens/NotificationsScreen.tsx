import {
  Stack,
  Text,
  Group,
  Button,
  Paper,
  Badge,
  Divider,
} from '@mantine/core';
import { notifications as MantineNotifications } from '@mantine/notifications';
import { IconChecks } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { BaseScreen } from '@/components/Screens/BaseScreen';
import { useNotifications, useNotificationMutations } from '@guallet/api-react';
import { NotificationDto } from '@guallet/api-client';
import { useNavigate } from '@tanstack/react-router';
import { NotificationRow } from '../components/NotificationRow';
import { validateRoute } from '@/utils/routeValidation';

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

  const handleNotificationClick = async (notification: NotificationDto) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    if (notification.action) {
      try {
        const { action } = notification;

        // Validate the action is a valid route using router.buildLocation
        const location = validateRoute({ to: action });
        await navigate({ to: location });
      } catch (error) {
        console.error('Failed to navigate from notification action', {
          notificationId: notification.id,
          action: notification.action,
          error,
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

  return (
    <BaseScreen
      isLoading={isLoading}
      title={t('screens.notifications.screen.title', 'Notifications')}
      actions={
        <Group gap="xs" wrap="nowrap">
          {unreadCount > 0 && (
            <Badge color="red" size="lg">
              {t(
                'screens.notifications.screen.unreadCount',
                '{{count}} unread',
                { count: unreadCount },
              )}
            </Badge>
          )}
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
      }
    >
      <Stack>
        <Divider />

        {isLoading ? (
          <Text c="dimmed">
            {t(
              'screens.notifications.screen.loading',
              'Loading notifications...',
            )}
          </Text>
        ) : notifications.length === 0 ? (
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
