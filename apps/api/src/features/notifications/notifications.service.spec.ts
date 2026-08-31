import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service.js';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Notification, NotificationType } from './entities/notification.entity.js';
import { NotFoundException } from '@nestjs/common';

describe('NotificationsService', () => {
  let service: NotificationsService;

  const mockNotificationRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: getRepositoryToken(Notification),
          useValue: mockNotificationRepository,
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAllUserNotifications', () => {
    it('should return all user notifications', async () => {
      const userId = 'user-123';
      const mockNotifications: Partial<Notification>[] = [
        {
          id: 'notif-1',
          user_id: userId,
          message: 'Test notification',
          type: NotificationType.INFO,
          is_read: false,
        },
      ];

      mockNotificationRepository.find.mockResolvedValue(mockNotifications);

      const result = await service.findAllUserNotifications(userId);

      expect(result).toEqual(mockNotifications);
      expect(mockNotificationRepository.find).toHaveBeenCalledWith({
        where: { user_id: userId },
        order: { created_at: 'DESC' },
      });
    });
  });

  describe('findUnreadUserNotifications', () => {
    it('should return only unread notifications', async () => {
      const userId = 'user-123';
      const mockNotifications: Partial<Notification>[] = [
        {
          id: 'notif-1',
          user_id: userId,
          message: 'Test notification',
          type: NotificationType.INFO,
          is_read: false,
        },
      ];

      mockNotificationRepository.find.mockResolvedValue(mockNotifications);

      const result = await service.findUnreadUserNotifications(userId);

      expect(result).toEqual(mockNotifications);
      expect(mockNotificationRepository.find).toHaveBeenCalledWith({
        where: { user_id: userId, is_read: false },
        order: { created_at: 'DESC' },
      });
    });
  });

  describe('update', () => {
    it('should update notification read status', async () => {
      const userId = 'user-123';
      const notificationId = 'notif-1';
      const mockNotification: Partial<Notification> = {
        id: notificationId,
        user_id: userId,
        message: 'Test notification',
        type: NotificationType.INFO,
        is_read: false,
      };

      mockNotificationRepository.findOne.mockResolvedValue(mockNotification);
      mockNotificationRepository.save.mockResolvedValue({
        ...mockNotification,
        is_read: true,
      });

      const result = await service.update({
        userId,
        notificationId,
        dto: { isRead: true },
      });

      expect(result.is_read).toBe(true);
    });

    it('should throw NotFoundException when notification not found', async () => {
      mockNotificationRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update({
          userId: 'user-123',
          notificationId: 'non-existent',
          dto: { isRead: true },
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a notification', async () => {
      const userId = 'user-123';
      const notificationId = 'notif-1';
      const mockNotification: Partial<Notification> = {
        id: notificationId,
        user_id: userId,
        message: 'Test notification',
        type: NotificationType.INFO,
        is_read: false,
      };

      mockNotificationRepository.findOne.mockResolvedValue(mockNotification);
      mockNotificationRepository.remove.mockResolvedValue(mockNotification);

      const result = await service.remove({ userId, notificationId });

      expect(result).toEqual(mockNotification);
    });

    it('should throw NotFoundException when notification not found', async () => {
      mockNotificationRepository.findOne.mockResolvedValue(null);

      await expect(
        service.remove({
          userId: 'user-123',
          notificationId: 'non-existent',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all user notifications as read', async () => {
      const userId = 'user-123';

      await service.markAllAsRead(userId);

      expect(mockNotificationRepository.update).toHaveBeenCalledWith(
        { user_id: userId, is_read: false },
        { is_read: true },
      );
    });
  });

  describe('createSystemNotification', () => {
    it('should create a system notification', async () => {
      const userId = 'user-123';
      const message = 'System notification';
      const mockNotification: Partial<Notification> = {
        id: 'notif-1',
        user_id: userId,
        message,
        type: NotificationType.INFO,
        is_read: false,
      };

      mockNotificationRepository.create.mockReturnValue(mockNotification);
      mockNotificationRepository.save.mockResolvedValue(mockNotification);

      const result = await service.createSystemNotification({
        userId,
        message,
      });

      expect(result).toEqual(mockNotification);
      expect(mockNotificationRepository.create).toHaveBeenCalledWith({
        user_id: userId,
        message,
        icon: undefined,
        type: NotificationType.INFO,
        action: undefined,
        is_read: false,
      });
    });
  });
});
