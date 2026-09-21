import { Test, TestingModule } from '@nestjs/testing';
import { UserInitializationService } from './user-initialization.service';
import { CategoriesService } from '../categories/categories.service';
import { EmailService } from '../email/email.service';
import { UsersService } from './users.service';

describe('UserInitializationService', () => {
  let service: UserInitializationService;

  const mockCategoriesService = {
    createDefaultCategoriesForUser: vi.fn(),
  };
  const mockEmailService = {
    sendWelcomeEmail: vi.fn(),
  };
  const mockUsersService = {
    findUserData: vi.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserInitializationService,
        {
          provide: CategoriesService,
          useValue: mockCategoriesService,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    service = module.get<UserInitializationService>(UserInitializationService);

    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('handleUserCreated', () => {
    it('should create default categories for the new user', async () => {
      const payload = { userId: 'user-123' };

      mockCategoriesService.createDefaultCategoriesForUser.mockResolvedValue(
        [],
      );
      mockUsersService.findUserData.mockResolvedValue({
        id: payload.userId,
        email: 'user@example.com',
        name: 'Test User',
      });

      await service.handleUserCreated(payload);

      expect(
        mockCategoriesService.createDefaultCategoriesForUser,
      ).toHaveBeenCalledWith(payload.userId);
      expect(mockEmailService.sendWelcomeEmail).toHaveBeenCalledWith({
        to: 'user@example.com',
        userName: 'Test User',
      });
    });

    it('should use a fallback name when the user has no name', async () => {
      const payload = { userId: 'user-123' };

      mockCategoriesService.createDefaultCategoriesForUser.mockResolvedValue(
        [],
      );
      mockUsersService.findUserData.mockResolvedValue({
        id: payload.userId,
        email: 'user@example.com',
        name: '',
      });

      await service.handleUserCreated(payload);

      expect(mockEmailService.sendWelcomeEmail).toHaveBeenCalledWith({
        to: 'user@example.com',
        userName: 'there',
      });
    });

    it('should skip the welcome email when the user cannot be found', async () => {
      const payload = { userId: 'user-123' };

      mockCategoriesService.createDefaultCategoriesForUser.mockResolvedValue(
        [],
      );
      mockUsersService.findUserData.mockResolvedValue(null);

      await service.handleUserCreated(payload);

      expect(mockEmailService.sendWelcomeEmail).not.toHaveBeenCalled();
    });

    it('should not throw when createDefaultCategoriesForUser fails', async () => {
      const payload = { userId: 'user-123' };

      mockCategoriesService.createDefaultCategoriesForUser.mockRejectedValue(
        new Error('DB error'),
      );
      mockUsersService.findUserData.mockResolvedValue({
        id: payload.userId,
        email: 'user@example.com',
        name: 'Test User',
      });

      await expect(service.handleUserCreated(payload)).resolves.not.toThrow();
      expect(mockEmailService.sendWelcomeEmail).toHaveBeenCalledWith({
        to: 'user@example.com',
        userName: 'Test User',
      });
    });
  });
});
