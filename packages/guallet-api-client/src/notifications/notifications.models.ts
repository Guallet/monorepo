export enum NotificationType {
  INFO = 'info',
  WARNING = 'warning',
  IMPORTANT = 'important',
  ACTION_REQUIRED = 'action_required',
}

export interface NotificationDto {
  id: string;
  message: string;
  icon: string | null;
  type: NotificationType;
  action: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface UpdateNotificationRequest {
  isRead: boolean;
}
