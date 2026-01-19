import { NotificationDto, NotificationType } from '@guallet/api-client';
import { ActionIcon, Box, Group, Stack, Tooltip, Text } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
import dayjs from 'dayjs';

interface NotificationItemProps {
  notification: NotificationDto;
  getIcon: (type: NotificationType) => React.ReactNode;
  onClick: () => void;
  onMarkAsRead: () => void;
}

export function NotificationItem({
  notification,
  getIcon,
  onClick,
  onMarkAsRead,
}: Readonly<NotificationItemProps>) {
  return (
    <Group
      gap="xs"
      wrap="nowrap"
      style={{
        cursor: notification.action ? 'pointer' : 'default',
        opacity: notification.isRead ? 0.6 : 1,
      }}
      onClick={onClick}
    >
      <Box>{getIcon(notification.type)}</Box>
      <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
        <Text size="xs" lineClamp={2}>
          {notification.message}
        </Text>
        <Text size="xs" c="dimmed">
          {dayjs(notification.createdAt).fromNow()}
        </Text>
      </Stack>
      {!notification.isRead && (
        <Tooltip label="Mark as read">
          <ActionIcon
            variant="subtle"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onMarkAsRead();
            }}
          >
            <IconCheck size={14} />
          </ActionIcon>
        </Tooltip>
      )}
    </Group>
  );
}
