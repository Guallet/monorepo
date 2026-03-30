import { Test, TestingModule } from '@nestjs/testing';
import { UserInitializationService } from './user-initialization.service';
import { CategoriesService } from '../categories/categories.service';

describe('UserInitializationService', () => {
  let service: UserInitializationService;

  const mockCategoriesService = {
    createDefaultCategoriesForUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserInitializationService,
        {
          provide: CategoriesService,
          useValue: mockCategoriesService,
        },
      ],
    }).compile();

    service = module.get<UserInitializationService>(UserInitializationService);

    jest.clearAllMocks();
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

      await service.handleUserCreated(payload);

      expect(
        mockCategoriesService.createDefaultCategoriesForUser,
      ).toHaveBeenCalledWith(payload.userId);
    });

    it('should not throw when createDefaultCategoriesForUser fails', async () => {
      const payload = { userId: 'user-123' };

      mockCategoriesService.createDefaultCategoriesForUser.mockRejectedValue(
        new Error('DB error'),
      );

      await expect(service.handleUserCreated(payload)).resolves.not.toThrow();
    });
  });
});
