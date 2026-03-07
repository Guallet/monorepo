import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { notifications } from '@/lib/notifications';
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
  const { notifications: notificationList, isLoading } = useNotifications();
  const {
    markAsRead,
    markAsUnread,
    markAllAsRead,
    deleteNotification,
    isUpdating,
    isDeleting,
  } = useNotificationMutations();

  const unreadCount = notificationList.filter((n) => !n.isRead).length;

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

        notifications.show({
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

  if (isLoading) {
    return (
      <BaseScreen>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            {t('screens.notifications.screen.title', 'Notifications')}
          </h1>
          <p className="text-muted-foreground">
            {t(
              'screens.notifications.screen.loading',
              'Loading notifications...',
            )}
          </p>
        </div>
      </BaseScreen>
    );
  }

  return (
    <BaseScreen>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              {t('screens.notifications.screen.title', 'Notifications')}
            </h1>
            {unreadCount > 0 && (
              <span className="rounded-full border border-red-500/40 bg-red-500/10 px-2 py-0.5 text-sm text-red-700">
                {t(
                  'screens.notifications.screen.unreadCount',
                  '{{count}} unread',
                  { count: unreadCount },
                )}
              </span>
            )}
          </div>

          {unreadCount > 0 && (
            <Button
              type="button"
              variant="outline"
              className="gap-2"
              onClick={() => markAllAsRead()}
              disabled={isUpdating}
            >
              <IconChecks size={16} />
              {t(
                'screens.notifications.screen.markAllAsRead',
                'Mark all as read',
              )}
            </Button>
          )}
        </div>

        <Separator />

        {notificationList.length === 0 ? (
          <Card className="p-8">
            <p className="text-center text-muted-foreground">
              {t(
                'screens.notifications.screen.emptyState',
                'You have no notifications',
              )}
            </p>
          </Card>
        ) : (
          <div className="space-y-2">
            {notificationList.map((notification) => (
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
          </div>
        )}
      </div>
    </BaseScreen>
  );
}
