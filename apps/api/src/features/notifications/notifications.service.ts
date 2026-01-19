import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity';
import { UpdateNotificationDto } from './dto/update-notification.dto';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  async findAllUserNotifications(userId: string): Promise<Notification[]> {
    return await this.notificationRepository.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
    });
  }

  async findUnreadUserNotifications(userId: string): Promise<Notification[]> {
    return await this.notificationRepository.find({
      where: { user_id: userId, is_read: false },
      order: { created_at: 'DESC' },
    });
  }

  async findUserNotification(args: {
    userId: string;
    notificationId: string;
  }): Promise<Notification | null> {
    const { userId, notificationId } = args;
    return await this.notificationRepository.findOne({
      where: { id: notificationId, user_id: userId },
    });
  }

  async update(args: {
    userId: string;
    notificationId: string;
    dto: UpdateNotificationDto;
  }): Promise<Notification> {
    const { userId, notificationId, dto } = args;

    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId, user_id: userId },
    });

    if (!notification) {
      throw new NotFoundException(
        `Notification with id ${notificationId} not found`,
      );
    }

    notification.is_read = dto.isRead;
    return await this.notificationRepository.save(notification);
  }

  async remove(args: {
    userId: string;
    notificationId: string;
  }): Promise<Notification> {
    const { userId, notificationId } = args;

    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId, user_id: userId },
    });

    if (!notification) {
      throw new NotFoundException(
        `Notification with id ${notificationId} not found`,
      );
    }

    return await this.notificationRepository.remove(notification);
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepository.update(
      { user_id: userId, is_read: false },
      { is_read: true },
    );
  }

  /**
   * Creates a system notification for a user.
   * This method should be called by other services to generate notifications
   * (e.g., when a new connection is established, when a sync fails, etc.)
   * Users cannot create notifications directly through the API.
   */
  async createSystemNotification(args: {
    userId: string;
    message: string;
    icon?: string;
    type?: NotificationType;
    action?: string;
  }): Promise<Notification> {
    const { userId, message, icon, type, action } = args;

    const notification = this.notificationRepository.create({
      user_id: userId,
      message,
      icon,
      type: type ?? NotificationType.INFO,
      action,
      is_read: false,
    });

    return await this.notificationRepository.save(notification);
  }
}
