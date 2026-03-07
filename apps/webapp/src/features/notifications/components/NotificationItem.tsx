import { NotificationDto, NotificationType } from '@guallet/api-client';
import { Button } from '@/components/ui/button';
import { IconCheck } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const itemOpacityClass = notification.isRead ? 'opacity-60' : 'opacity-100';
  const itemCursorClass = notification.action ? 'cursor-pointer' : 'cursor-default';

  return (
    <div className={`flex items-start gap-2 rounded-md border p-2 ${itemOpacityClass} ${itemCursorClass}`}>
      <button
        type="button"
        className="flex min-w-0 flex-1 items-start gap-2 text-left"
        onClick={onClick}
      >
        <div>{getIcon(notification.type)}</div>
        <div className="min-w-0 flex-1 space-y-1">
          <p className="line-clamp-2 text-xs">{notification.message}</p>
          <p className="text-xs text-muted-foreground">
            {dayjs(notification.createdAt).fromNow()}
          </p>
        </div>
      </button>

      {!notification.isRead && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          title={t(
            'screens.notifications.screen.actions.markAsRead',
            'Mark as read',
          )}
          onClick={(e) => {
            e.stopPropagation();
            onMarkAsRead();
          }}
        >
          <IconCheck size={14} />
        </Button>
      )}
    </div>
  );
}
