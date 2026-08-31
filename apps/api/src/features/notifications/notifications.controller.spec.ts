import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from './notifications.controller.js';
import { NotificationsService } from './notifications.service.js';
import { NotFoundException } from '@nestjs/common';
import { UserPrincipal } from '../../auth/user-principal.js';
import { Notification, NotificationType } from './entities/notification.entity.js';
import { UpdateNotificationDto } from './dto/update-notification.dto.js';

describe('NotificationsController', () => {
  let controller: NotificationsController;

  const mockNotificationsService = {
    findAllUserNotifications: jest.fn(),
    findUnreadUserNotifications: jest.fn(),
    findUserNotification: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    markAllAsRead: jest.fn(),
  };

  const mockUser: UserPrincipal = new UserPrincipal(
    'user-123',
    'test@example.com',
    [],
  );

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        {
          provide: NotificationsService,
          useValue: mockNotificationsService,
        },
      ],
    }).compile();

    controller = module.get<NotificationsController>(NotificationsController);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all user notifications', async () => {
      const mockNotifications: Partial<Notification>[] = [
        {
          id: 'notif-1',
          user_id: mockUser.id,
          message: 'Test notification 1',
          icon: '🔔',
          type: NotificationType.INFO,
          is_read: false,
          created_at: new Date(),
        },
        {
          id: 'notif-2',
          user_id: mockUser.id,
          message: 'Test notification 2',
          icon: '⚠️',
          type: NotificationType.WARNING,
          is_read: true,
          created_at: new Date(),
        },
      ];

      mockNotificationsService.findAllUserNotifications.mockResolvedValue(
        mockNotifications,
      );

      const result = await controller.findAll(mockUser);

      expect(result).toBeDefined();
      expect(result.length).toBe(2);
      expect(
        mockNotificationsService.findAllUserNotifications,
      ).toHaveBeenCalledWith(mockUser.id);
    });

    it('should return empty array when user has no notifications', async () => {
      mockNotificationsService.findAllUserNotifications.mockResolvedValue([]);

      const result = await controller.findAll(mockUser);

      expect(result).toEqual([]);
    });
  });

  describe('findUnread', () => {
    it('should return only unread notifications', async () => {
      const mockNotifications: Partial<Notification>[] = [
        {
          id: 'notif-1',
          user_id: mockUser.id,
          message: 'Unread notification',
          icon: '🔔',
          type: NotificationType.INFO,
          is_read: false,
          created_at: new Date(),
        },
      ];

      mockNotificationsService.findUnreadUserNotifications.mockResolvedValue(
        mockNotifications,
      );

      const result = await controller.findUnread(mockUser);

      expect(result).toBeDefined();
      expect(result.length).toBe(1);
      expect(result[0].isRead).toBe(false);
      expect(
        mockNotificationsService.findUnreadUserNotifications,
      ).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe('findOne', () => {
    it('should return a specific notification', async () => {
      const notificationId = 'notif-1';
      const mockNotification: Partial<Notification> = {
        id: notificationId,
        user_id: mockUser.id,
        message: 'Test notification',
        icon: '🔔',
        type: NotificationType.INFO,
        is_read: false,
        created_at: new Date(),
      };

      mockNotificationsService.findUserNotification.mockResolvedValue(
        mockNotification,
      );

      const result = await controller.findOne(mockUser, notificationId);

      expect(result).toBeDefined();
      expect(
        mockNotificationsService.findUserNotification,
      ).toHaveBeenCalledWith({
        userId: mockUser.id,
        notificationId: notificationId,
      });
    });

    it('should throw NotFoundException when notification not found', async () => {
      const notificationId = 'non-existent';
      mockNotificationsService.findUserNotification.mockResolvedValue(null);

      await expect(
        controller.findOne(mockUser, notificationId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a notification to read', async () => {
      const notificationId = 'notif-1';
      const updateDto: UpdateNotificationDto = {
        isRead: true,
      };

      const mockUpdatedNotification: Partial<Notification> = {
        id: notificationId,
        user_id: mockUser.id,
        message: 'Test notification',
        icon: '🔔',
        type: NotificationType.INFO,
        is_read: true,
        created_at: new Date(),
      };

      mockNotificationsService.update.mockResolvedValue(
        mockUpdatedNotification,
      );

      const result = await controller.update(
        mockUser,
        notificationId,
        updateDto,
      );

      expect(result).toBeDefined();
      expect(result.isRead).toBe(true);
      expect(mockNotificationsService.update).toHaveBeenCalledWith({
        userId: mockUser.id,
        notificationId: notificationId,
        dto: updateDto,
      });
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read', async () => {
      mockNotificationsService.markAllAsRead.mockResolvedValue(undefined);

      await controller.markAllAsRead(mockUser);

      expect(mockNotificationsService.markAllAsRead).toHaveBeenCalledWith(
        mockUser.id,
      );
    });
  });

  describe('remove', () => {
    it('should remove a notification', async () => {
      const notificationId = 'notif-1';
      const mockNotification: Partial<Notification> = {
        id: notificationId,
        user_id: mockUser.id,
        message: 'Test notification',
        icon: '🔔',
        type: NotificationType.INFO,
        is_read: false,
        created_at: new Date(),
      };

      mockNotificationsService.remove.mockResolvedValue(mockNotification);

      const result = await controller.remove(mockUser, notificationId);

      expect(result).toBeDefined();
      expect(mockNotificationsService.remove).toHaveBeenCalledWith({
        userId: mockUser.id,
        notificationId: notificationId,
      });
    });
  });
});
