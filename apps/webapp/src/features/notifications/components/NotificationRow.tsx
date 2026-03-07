import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

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
  const isRead = notification.isRead;
  const itemOpacityClass = isRead ? 'opacity-70' : 'opacity-100';
  const itemCursorClass = notification.action ? 'cursor-pointer' : 'cursor-default';

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
          <span className="rounded-full border border-orange-500/40 bg-orange-500/10 px-2 py-0.5 text-xs text-orange-700">
            {t('screens.notifications.screen.types.warning', 'Warning')}
          </span>
        );
      case NotificationType.IMPORTANT:
        return (
          <span className="rounded-full border border-red-500/40 bg-red-500/10 px-2 py-0.5 text-xs text-red-700">
            {t('screens.notifications.screen.types.important', 'Important')}
          </span>
        );
      case NotificationType.ACTION_REQUIRED:
        return (
          <span className="rounded-full border border-blue-500/40 bg-blue-500/10 px-2 py-0.5 text-xs text-blue-700">
            {t(
              'screens.notifications.screen.types.actionRequired',
              'Action Required',
            )}
          </span>
        );
      case NotificationType.INFO:
      default:
        return (
          <span className="rounded-full border border-slate-500/40 bg-slate-500/10 px-2 py-0.5 text-xs text-slate-700">
            {t('screens.notifications.screen.types.info', 'Info')}
          </span>
        );
    }
  };

  return (
    <Card
      className={`p-4 ${itemOpacityClass} ${itemCursorClass}`}
      onClick={() => onClick(notification)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <div className="mt-1">{getNotificationIcon(notification.type)}</div>
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              {getTypeBadge(notification.type)}
              {!isRead && (
                <span className="rounded-full border border-blue-500/40 bg-blue-500/10 px-2 py-0.5 text-xs text-blue-700">
                  {t('screens.notifications.screen.badges.new', 'New')}
                </span>
              )}
            </div>
            <p className="text-sm">{notification.message}</p>
            <p className="text-xs text-muted-foreground">
              {dayjs(notification.createdAt).fromNow()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {isRead ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={isUpdating}
              onClick={(e) => {
                e.stopPropagation();
                onMarkAsUnread(notification.id);
              }}
              title={t(
                'screens.notifications.screen.actions.markAsUnread',
                'Mark as unread',
              )}
            >
              <IconEyeOff size={16} />
            </Button>
          ) : (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={isUpdating}
              onClick={(e) => {
                e.stopPropagation();
                onMarkAsRead(notification.id);
              }}
              title={t(
                'screens.notifications.screen.actions.markAsRead',
                'Mark as read',
              )}
            >
              <IconCheck size={16} />
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={isDeleting}
            className="text-destructive hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(notification.id);
            }}
            title={t(
              'screens.notifications.screen.actions.delete',
              'Delete notification',
            )}
          >
            <IconTrash size={16} />
          </Button>
        </div>
      </div>
    </Card>
  );
}
