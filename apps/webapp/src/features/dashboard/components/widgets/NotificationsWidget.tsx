import { useUnreadNotifications } from '@guallet/api-react';
import { NotificationType, NotificationDto } from '@guallet/api-client';
import { WidgetCard } from './WidgetCard';
import {
  Loader,
  Stack,
  Text,
  Group,
  Box,
  Center,
  Badge,
  ScrollArea,
} from '@mantine/core';
import {
  IconBell,
  IconInfoCircle,
  IconAlertTriangle,
  IconAlertCircle,
} from '@tabler/icons-react';
import { useTheme } from '@guallet/ui-react';
import { useRouter } from '@tanstack/react-router';

const MAX_ITEMS = 3;

const NOTIFICATION_ICONS: Record<NotificationType, typeof IconInfoCircle> = {
  [NotificationType.INFO]: IconInfoCircle,
  [NotificationType.WARNING]: IconAlertTriangle,
  [NotificationType.IMPORTANT]: IconAlertCircle,
  [NotificationType.ACTION_REQUIRED]: IconAlertCircle,
};

const NOTIFICATION_COLORS: Record<NotificationType, string> = {
  [NotificationType.INFO]: '#005EB8',
  [NotificationType.WARNING]: '#FAE100',
  [NotificationType.IMPORTANT]: '#DA291C',
  [NotificationType.ACTION_REQUIRED]: '#DA291C',
};

function NotificationRow({
  notification,
}: Readonly<{ notification: NotificationDto }>) {
  const { colors } = useTheme();
  const IconComponent = NOTIFICATION_ICONS[notification.type] ?? IconInfoCircle;
  const iconColor = NOTIFICATION_COLORS[notification.type] ?? colors.primary;

  return (
    <Box
      p="sm"
      style={{
        borderRadius: '8px',
        backgroundColor: colors.surface,
        border: `1px solid ${colors.paleGrey}`,
        opacity: notification.isRead ? 0.6 : 1,
      }}
    >
      <Group gap="sm" align="flex-start">
        <Box style={{ flexShrink: 0, marginTop: 2 }}>
          <IconComponent size={18} style={{ color: iconColor }} />
        </Box>
        <Stack gap={4} style={{ flex: 1 }}>
          <Text size="sm" fw={notification.isRead ? 400 : 600}>
            {notification.message}
          </Text>
          <Text size="xs" c="dimmed">
            {new Date(notification.createdAt).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </Stack>
        {!notification.isRead && (
          <Badge
            size="xs"
            variant="filled"
            color="blue"
            style={{ flexShrink: 0 }}
          >
            New
          </Badge>
        )}
      </Group>
    </Box>
  );
}

export function NotificationsWidget() {
  const { notifications, unreadCount, isLoading } = useUnreadNotifications();
  const { colors } = useTheme();
  const router = useRouter();

  const hasMore = notifications.length > MAX_ITEMS;
  const displayNotifications = notifications.slice(0, MAX_ITEMS);

  return (
    <WidgetCard
      title="Notifications"
      icon={<IconBell size={20} />}
      footer={
        <Text
          component="a"
          size="sm"
          fw={500}
          style={{
            color: colors.primary,
            cursor: 'pointer',
            textDecoration: 'none',
            display: 'block',
            textAlign: 'center',
          }}
          onClick={() => router.navigate({ to: '/notifications' })}
        >
          View all notifications →
        </Text>
      }
    >
      {isLoading ? (
        <Center h={150}>
          <Loader size="md" />
        </Center>
      ) : notifications.length > 0 ? (
        <Stack gap="sm">
          {unreadCount > 0 && (
            <Box
              p="sm"
              style={{
                borderRadius: '8px',
                backgroundColor: `${colors.primary}12`,
                border: `1px solid ${colors.primary}40`,
                textAlign: 'center',
              }}
            >
              <Text size="sm" fw={600} style={{ color: colors.primary }}>
                {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
              </Text>
            </Box>
          )}

          <ScrollArea.Autosize mah={200}>
            <Stack gap="xs">
              {displayNotifications.map((notification) => (
                <NotificationRow
                  key={notification.id}
                  notification={notification}
                />
              ))}
              {hasMore && (
                <Text size="xs" c="dimmed" ta="center">
                  +{notifications.length - MAX_ITEMS} more notification
                  {notifications.length - MAX_ITEMS !== 1 ? 's' : ''}
                </Text>
              )}
            </Stack>
          </ScrollArea.Autosize>
        </Stack>
      ) : (
        <Center h={150}>
          <Stack gap="xs" align="center">
            <IconBell size={48} style={{ color: colors.paleGrey }} />
            <Text size="sm" c="dimmed" ta="center">
              No new notifications.
            </Text>
          </Stack>
        </Center>
      )}
    </WidgetCard>
  );
}
