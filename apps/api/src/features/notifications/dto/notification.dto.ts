import { ApiProperty } from '@nestjs/swagger';
import {
  Notification,
  NotificationType,
} from '../entities/notification.entity.js';

export class NotificationDto {
  @ApiProperty({ description: 'The id of the notification' })
  id: string;

  @ApiProperty({ description: 'The message of the notification' })
  message: string;

  @ApiProperty({ description: 'The icon of the notification', nullable: true })
  icon: string | null;

  @ApiProperty({
    description: 'The type of the notification',
    enum: NotificationType,
  })
  type: NotificationType;

  @ApiProperty({
    description: 'The action deep link for navigation',
    nullable: true,
  })
  action: string | null;

  @ApiProperty({ description: 'Whether the notification has been read' })
  isRead: boolean;

  @ApiProperty({ description: 'The date the notification was created' })
  createdAt: Date;

  static fromDomain(domain: Notification): NotificationDto {
    return {
      id: domain.id,
      message: domain.message,
      icon: domain.icon ?? null,
      type: domain.type,
      action: domain.action ?? null,
      isRead: domain.is_read,
      createdAt: domain.created_at,
    };
  }
}
