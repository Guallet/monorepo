import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import {
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;

  const mockUserRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    upsert: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('upsertUser', () => {
    it('should upsert a user and return the entity', async () => {
      const userData = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        avatar_url: 'http://example.com/avatar.jpg',
      };

      const mockUser: Partial<User> = {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        profile_image_url: userData.avatar_url,
      };

      mockUserRepository.upsert.mockResolvedValue(undefined);
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.upsertUser(userData);

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.upsert).toHaveBeenCalled();
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: userData.id },
      });
    });

    it('should throw NotFoundException if user not found after upsert', async () => {
      const userData = {
        id: 'user-123',
        email: 'test@example.com',
      };

      mockUserRepository.upsert.mockResolvedValue(undefined);
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.upsertUser(userData)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('registerUser', () => {
    it('should register a new user', async () => {
      const userData = {
        user_id: 'user-123',
        dto: {
          name: 'Test User',
          email: 'test@example.com',
          profile_src: 'http://example.com/avatar.jpg',
        },
      };

      const mockUser: Partial<User> = {
        id: userData.user_id,
        name: userData.dto.name,
        email: userData.dto.email,
      };

      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.save.mockResolvedValue(mockUser);

      const result = await service.registerUser(userData);

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: userData.user_id },
      });
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it('should throw ConflictException if user already exists', async () => {
      const userData = {
        user_id: 'user-123',
        dto: {
          name: 'Test User',
          email: 'test@example.com',
          profile_src: 'http://example.com/avatar.jpg',
        },
      };

      const existingUser: Partial<User> = {
        id: userData.user_id,
      };

      mockUserRepository.findOne.mockResolvedValue(existingUser);

      await expect(service.registerUser(userData)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findUserData', () => {
    it('should return user data', async () => {
      const userId = 'user-123';
      const mockUser: Partial<User> = {
        id: userId,
        email: 'test@example.com',
        name: 'Test User',
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findUserData(userId);

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });

    it('should return null when user not found', async () => {
      const userId = 'non-existent';

      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await service.findUserData(userId);

      expect(result).toBeNull();
    });
  });

  describe('updateUser', () => {
    it('should update user details', async () => {
      const updateData = {
        user_id: 'user-123',
        dto: {
          name: 'Updated Name',
          email: 'updated@example.com',
          profile_src: 'http://example.com/new-avatar.jpg',
        },
      };

      const existingUser: Partial<User> = {
        id: updateData.user_id,
        email: 'old@example.com',
        name: 'Old Name',
        profile_image_url: 'http://example.com/old-avatar.jpg',
      };

      const updatedUser: Partial<User> = {
        ...existingUser,
        name: updateData.dto.name,
        email: updateData.dto.email,
        profile_image_url: updateData.dto.profile_src,
      };

      mockUserRepository.findOne.mockResolvedValue(existingUser);
      mockUserRepository.save.mockResolvedValue(updatedUser);

      const result = await service.updateUser(updateData);

      expect(result).toEqual(updatedUser);
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when user not found', async () => {
      const updateData = {
        user_id: 'non-existent',
        dto: {
          name: 'Updated Name',
        },
      };

      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.updateUser(updateData)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('removeUser', () => {
    it('should remove a user', async () => {
      const userId = 'user-123';
      const mockUser: Partial<User> = {
        id: userId,
        email: 'test@example.com',
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.remove.mockResolvedValue(mockUser);

      const result = await service.removeUser(userId, {
        deleteFromAuthService: true,
      });

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.remove).toHaveBeenCalledWith(mockUser);
    });

    it('should throw NotFoundException when user not found', async () => {
      const userId = 'non-existent';

      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(
        service.removeUser(userId, { deleteFromAuthService: false }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getUserRoles', () => {
    it('should return user roles', async () => {
      const userId = 'user-123';
      const mockUser: Partial<User> = {
        id: userId,
        roles: ['admin', 'beta'],
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.getUserRoles(userId);

      expect(result).toEqual(['admin', 'beta']);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      const userId = 'non-existent';

      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.getUserRoles(userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateUserSettings', () => {
    it('should update user settings', async () => {
      const settingsData = {
        userId: 'user-123',
        dto: {
          currencies: {
            default_currency: 'EUR',
            preferred_currencies: ['EUR', 'GBP'],
          },
          date_format: 'DD/MM/YYYY',
        },
      };

      const mockUser: Partial<User> = {
        id: settingsData.userId,
        default_currency: 'USD',
        preferred_currencies: ['USD'],
        date_format: 'MM/DD/YYYY',
      };

      const updatedUser: Partial<User> = {
        ...mockUser,
        default_currency: 'EUR',
        preferred_currencies: ['EUR', 'GBP'],
        date_format: 'DD/MM/YYYY',
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.save.mockResolvedValue(updatedUser);

      const result = await service.updateUserSettings(settingsData);

      expect(result).toEqual(updatedUser);
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when user not found', async () => {
      const settingsData = {
        userId: 'non-existent',
        dto: {
          date_format: 'DD/MM/YYYY',
        },
      };

      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.updateUserSettings(settingsData)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException for invalid date format', async () => {
      const settingsData = {
        userId: 'user-123',
        dto: {
          date_format: 'INVALID_FORMAT',
        },
      };

      const mockUser: Partial<User> = {
        id: settingsData.userId,
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      await expect(service.updateUserSettings(settingsData)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should accept valid date formats', async () => {
      const validFormats = ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY/MM/DD'];

      for (const format of validFormats) {
        const settingsData = {
          userId: 'user-123',
          dto: {
            date_format: format,
          },
        };

        const mockUser: Partial<User> = {
          id: settingsData.userId,
          date_format: 'MM/DD/YYYY',
        };

        const updatedUser: Partial<User> = {
          ...mockUser,
          date_format: format,
        };

        mockUserRepository.findOne.mockResolvedValue(mockUser);
        mockUserRepository.save.mockResolvedValue(updatedUser);

        const result = await service.updateUserSettings(settingsData);

        expect(result.date_format).toBe(format);
      }
    });
  });
});
