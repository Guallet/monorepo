import {
  Stack,
  Title,
  Text,
  Group,
  Button,
  Paper,
  Badge,
  ActionIcon,
  Divider,
  Box,
} from '@mantine/core';
import {
  IconTrash,
  IconCheck,
  IconInfoCircle,
  IconAlertTriangle,
  IconAlertCircle,
  IconHandClick,
  IconChecks,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { BaseScreen } from '@/components/Screens/BaseScreen';
import { useNotifications, useNotificationMutations } from '@guallet/api-react';
import { NotificationDto, NotificationType } from '@guallet/api-client';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useNavigate } from '@tanstack/react-router';

dayjs.extend(relativeTime);

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

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.WARNING:
        return <IconAlertTriangle size={20} color="orange" />;
      case NotificationType.IMPORTANT:
        return <IconAlertCircle size={20} color="red" />;
      case NotificationType.ACTION_REQUIRED:
        return <IconHandClick size={20} color="blue" />;
      case NotificationType.INFO:
      default:
        return <IconInfoCircle size={20} color="gray" />;
    }
  };

  const getTypeBadge = (type: NotificationType) => {
    switch (type) {
      case NotificationType.WARNING:
        return (
          <Badge color="orange" size="xs">
            {t('screens.notifications.screen.types.warning', 'Warning')}
          </Badge>
        );
      case NotificationType.IMPORTANT:
        return (
          <Badge color="red" size="xs">
            {t('screens.notifications.screen.types.important', 'Important')}
          </Badge>
        );
      case NotificationType.ACTION_REQUIRED:
        return (
          <Badge color="blue" size="xs">
            {t(
              'screens.notifications.screen.types.actionRequired',
              'Action Required',
            )}
          </Badge>
        );
      case NotificationType.INFO:
      default:
        return (
          <Badge color="gray" size="xs">
            {t('screens.notifications.screen.types.info', 'Info')}
          </Badge>
        );
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
              <Paper
                key={notification.id}
                p="md"
                withBorder
                style={{
                  opacity: notification.isRead ? 0.7 : 1,
                  cursor: notification.action ? 'pointer' : 'default',
                }}
                onClick={() => handleNotificationClick(notification)}
              >
                <Group justify="space-between" wrap="nowrap" align="flex-start">
                  <Group gap="md" wrap="nowrap" align="flex-start">
                    <Box mt={4}>{getNotificationIcon(notification.type)}</Box>
                    <Stack gap={4}>
                      <Group gap="xs">
                        {getTypeBadge(notification.type)}
                        {!notification.isRead && (
                          <Badge color="blue" size="xs" variant="dot">
                            {t(
                              'screens.notifications.screen.badges.new',
                              'New',
                            )}
                          </Badge>
                        )}
                      </Group>
                      <Text size="sm">{notification.message}</Text>
                      <Text size="xs" c="dimmed">
                        {dayjs(notification.createdAt).fromNow()}
                      </Text>
                    </Stack>
                  </Group>
                  <Group gap="xs">
                    {notification.isRead ? (
                      <ActionIcon
                        variant="subtle"
                        color="gray"
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsUnread(notification.id);
                        }}
                        title={t(
                          'screens.notifications.screen.actions.markAsUnread',
                          'Mark as unread',
                        )}
                        loading={isUpdating}
                      >
                        <IconCheck size={16} />
                      </ActionIcon>
                    ) : (
                      <ActionIcon
                        variant="subtle"
                        color="blue"
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notification.id);
                        }}
                        title={t(
                          'screens.notifications.screen.actions.markAsRead',
                          'Mark as read',
                        )}
                        loading={isUpdating}
                      >
                        <IconCheck size={16} />
                      </ActionIcon>
                    )}
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                      title={t(
                        'screens.notifications.screen.actions.delete',
                        'Delete notification',
                      )}
                      loading={isDeleting}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                </Group>
              </Paper>
            ))}
          </Stack>
        )}
      </Stack>
    </BaseScreen>
  );
}
