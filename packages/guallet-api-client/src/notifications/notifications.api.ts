import { GualletClientImpl } from './../GualletClient';
import {
  NotificationDto,
  UpdateNotificationRequest,
} from './notifications.models';

const NOTIFICATIONS_PATH = 'notifications';

export class NotificationsApi {
  constructor(private readonly client: GualletClientImpl) {}

  async getAll(): Promise<NotificationDto[]> {
    return await this.client.get<NotificationDto[]>({
      path: NOTIFICATIONS_PATH,
    });
  }

  async getUnread(): Promise<NotificationDto[]> {
    return await this.client.get<NotificationDto[]>({
      path: `${NOTIFICATIONS_PATH}/unread`,
    });
  }

  async get(id: string): Promise<NotificationDto> {
    return await this.client.get<NotificationDto>({
      path: `${NOTIFICATIONS_PATH}/${id}`,
    });
  }

  async update({
    id,
    dto,
  }: {
    id: string;
    dto: UpdateNotificationRequest;
  }): Promise<NotificationDto> {
    return await this.client.patch<NotificationDto, UpdateNotificationRequest>({
      path: `${NOTIFICATIONS_PATH}/${id}`,
      payload: dto,
    });
  }

  async markAllAsRead(): Promise<void> {
    await this.client.post<void, object>({
      path: `${NOTIFICATIONS_PATH}/mark-all-read`,
      payload: {},
    });
  }

  async delete(id: string): Promise<void> {
    await this.client.fetch_delete<NotificationDto>({
      path: `${NOTIFICATIONS_PATH}/${id}`,
    });
  }
}
