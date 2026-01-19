import {
  Paper,
  Group,
  Box,
  Stack,
  Badge,
  Text,
  ActionIcon,
} from '@mantine/core';
import {
  IconCheck,
  IconTrash,
  IconInfoCircle,
  IconAlertTriangle,
  IconAlertCircle,
  IconHandClick,
  IconEyeOff,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { NotificationDto, NotificationType } from '@guallet/api-client';
import dayjs from 'dayjs';

interface NotificationRowProps {
  notification: NotificationDto;
  onClick: (notification: NotificationDto) => void;
  onMarkAsRead: (id: string) => void;
  onMarkAsUnread: (id: string) => void;
  onDelete: (id: string) => void;
  isUpdating: boolean;
  isDeleting: boolean;
}

export function NotificationRow({
  notification,
  onClick,
  onMarkAsRead,
  onMarkAsUnread,
  onDelete,
  isUpdating,
  isDeleting,
}: Readonly<NotificationRowProps>) {
  const { t } = useTranslation();

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

  return (
    <Paper
      p="md"
      withBorder
      style={{
        opacity: notification.isRead ? 0.7 : 1,
        cursor: notification.action ? 'pointer' : 'default',
      }}
      onClick={() => onClick(notification)}
    >
      <Group justify="space-between" wrap="nowrap" align="flex-start">
        <Group gap="md" wrap="nowrap" align="flex-start">
          <Box mt={4}>{getNotificationIcon(notification.type)}</Box>
          <Stack gap={4}>
            <Group gap="xs">
              {getTypeBadge(notification.type)}
              {!notification.isRead && (
                <Badge color="blue" size="xs" variant="dot">
                  {t('screens.notifications.screen.badges.new', 'New')}
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
                onMarkAsUnread(notification.id);
              }}
              title={t(
                'screens.notifications.screen.actions.markAsUnread',
                'Mark as unread',
              )}
              loading={isUpdating}
            >
              <IconEyeOff size={16} />
            </ActionIcon>
          ) : (
            <ActionIcon
              variant="subtle"
              color="blue"
              onClick={(e) => {
                e.stopPropagation();
                onMarkAsRead(notification.id);
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
              onDelete(notification.id);
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
  );
}
