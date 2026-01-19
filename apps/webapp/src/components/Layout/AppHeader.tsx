import {
  Burger,
  Center,
  Group,
  Indicator,
  Popover,
  Title,
  Tooltip,
  UnstyledButton,
  Text,
  Stack,
  Button,
  Divider,
  ActionIcon,
  Box,
} from "@mantine/core";
import {
  IconBell,
  IconUser,
  IconCheck,
  IconInfoCircle,
  IconAlertTriangle,
  IconAlertCircle,
  IconHandClick,
} from "@tabler/icons-react";
import { useNavigate } from "@tanstack/react-router";
import { GualletLogo } from "../GualletLogo/GualletLogo";
import {
  useUnreadNotifications,
  useNotificationMutations,
} from "@guallet/api-react";
import { NotificationDto, NotificationType } from "@guallet/api-client";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

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
            navigate({ to: "/dashboard" });
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

function NotificationIcon() {
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
    <Popover width={320} position="bottom-end" withArrow shadow="md">
      <Popover.Target>
        <UnstyledButton>
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
            onClick={() => navigate({ to: "/notifications" })}
          >
            View all notifications
          </Button>
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
}

interface NotificationItemProps {
  notification: NotificationDto;
  getIcon: (type: NotificationType) => React.ReactNode;
  onClick: () => void;
  onMarkAsRead: () => void;
}

function NotificationItem({
  notification,
  getIcon,
  onClick,
  onMarkAsRead,
}: NotificationItemProps) {
  return (
    <Group
      gap="xs"
      wrap="nowrap"
      style={{
        cursor: notification.action ? "pointer" : "default",
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
