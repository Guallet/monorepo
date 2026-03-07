import { NotificationType, NotificationDto } from '@guallet/api-client';
import {
  useUnreadNotifications,
  useNotificationMutations,
} from '@guallet/api-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { notifications as appNotifications } from '@/lib/notifications';
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
import { ResponsiveModal } from '@guallet/ui-react';

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
      if (isDestinationValid) {
        navigate({ to: action });
      } else {
        console.error('Failed to navigate from notification action', {
          notificationId: notification.id,
          action: notification.action,
        });

        appNotifications.show({
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
        <p className="py-4 text-center text-sm text-muted-foreground">
          {t('screens.notifications.icon.loading', 'Loading...')}
        </p>
      );
    }

    if (displayNotifications.length === 0) {
      return (
        <p className="py-4 text-center text-sm text-muted-foreground">
          {t(
            'screens.notifications.icon.noNotifications',
            'No new notifications',
          )}
        </p>
      );
    }

    return (
      <div className="space-y-2">
        {displayNotifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            getIcon={getNotificationIcon}
            onClick={() => handleNotificationClick(notification)}
            onMarkAsRead={() => markAsRead(notification.id)}
          />
        ))}
      </div>
    );
  };

  return (
    <>
      <button
        type="button"
        className="relative rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        title={t('screens.notifications.screen.title', 'Notifications')}
        onClick={() => {
          setOpened(true);
        }}
      >
        <IconBell className="h-5 w-5" />
        {hasUnread ? (
          <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-red-500" />
        ) : null}
      </button>

      <ResponsiveModal
        opened={opened}
        onClose={() => {
          setOpened(false);
        }}
        title={<span>{t('screens.notifications.screen.title', 'Notifications')}</span>}
        size="md"
      >
        <div className="space-y-3">
          {hasUnread ? (
            <p className="text-xs text-muted-foreground">
              {t('screens.notifications.screen.unreadCount', '{{count}} unread', {
                count: unreadCount,
              })}
            </p>
          ) : null}

          <Separator />
          {renderNotificationContent()}
          <Separator />

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => {
              setOpened(false);
              navigate({ to: '/notifications' });
            }}
          >
            {t('screens.notifications.icon.viewAll', 'View all notifications')}
          </Button>
        </div>
      </ResponsiveModal>
    </>
  );
}
