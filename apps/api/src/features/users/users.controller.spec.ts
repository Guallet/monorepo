import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { NotFoundException } from '@nestjs/common';
import { UserPrincipal } from 'src/auth/user-principal';
import { User } from './entities/user.entity';

describe('UsersController', () => {
  let controller: UsersController;

  const mockUsersService = {
    findUserData: jest.fn(),
    registerUser: jest.fn(),
    updateUser: jest.fn(),
    removeUser: jest.fn(),
    updateUserSettings: jest.fn(),
  };

  const mockUser: UserPrincipal = new UserPrincipal(
    'user-123',
    'test@example.com',
    [],
  );

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findUserDetails', () => {
    it('should return user details', async () => {
      const mockUserData: Partial<User> = {
        id: mockUser.id,
        email: mockUser.email,
        name: 'Test User',
      };

      mockUsersService.findUserData.mockResolvedValue(mockUserData);

      const result = await controller.findUserDetails(mockUser);

      expect(result).toBeDefined();
      expect(mockUsersService.findUserData).toHaveBeenCalledWith(mockUser.id);
    });

    it('should throw NotFoundException when user not found', async () => {
      mockUsersService.findUserData.mockResolvedValue(null);

      await expect(controller.findUserDetails(mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('registerUser', () => {
    it('should register a new user', async () => {
      const createUserDto = {
        name: 'Test User',
        email: 'test@example.com',
        profile_src: 'http://example.com/avatar.jpg',
      };

      const mockUserData: Partial<User> = {
        id: mockUser.id,
        ...createUserDto,
      };

      mockUsersService.registerUser.mockResolvedValue(mockUserData);

      const result = await controller.registerUser(mockUser, createUserDto);

      expect(result).toBeDefined();
      expect(mockUsersService.registerUser).toHaveBeenCalledWith({
        user_id: mockUser.id,
        dto: createUserDto,
      });
    });
  });

  describe('updateUser', () => {
    it('should update user details', async () => {
      const updateUserDto = {
        name: 'Updated Name',
        email: 'updated@example.com',
      };

      const mockUserData: Partial<User> = {
        id: mockUser.id,
        ...updateUserDto,
      };

      mockUsersService.updateUser.mockResolvedValue(mockUserData);

      const result = await controller.updateUser(mockUser, updateUserDto);

      expect(result).toBeDefined();
      expect(mockUsersService.updateUser).toHaveBeenCalledWith({
        user_id: mockUser.id,
        dto: updateUserDto,
      });
    });
  });

  describe('deleteUser', () => {
    it('should delete a user', async () => {
      const mockUserData: Partial<User> = {
        id: mockUser.id,
      };

      mockUsersService.removeUser.mockResolvedValue(mockUserData);

      const result = await controller.deleteUser(mockUser);

      expect(result).toEqual({ message: 'User deleted successfully' });
      expect(mockUsersService.removeUser).toHaveBeenCalledWith(mockUser.id, {
        deleteFromAuthService: true,
      });
    });
  });

  describe('getUserSettings', () => {
    it('should return user settings', async () => {
      const mockUserData: Partial<User> = {
        id: mockUser.id,
        email: mockUser.email,
        default_currency: 'GBP',
        preferred_currencies: ['GBP', 'EUR'],
        date_format: 'MM/DD/YYYY',
      };

      mockUsersService.findUserData.mockResolvedValue(mockUserData);

      const result = await controller.getUserSettings(mockUser);

      expect(result).toBeDefined();
      expect(mockUsersService.findUserData).toHaveBeenCalledWith(mockUser.id);
    });

    it('should throw NotFoundException when user not found', async () => {
      mockUsersService.findUserData.mockResolvedValue(null);

      await expect(controller.getUserSettings(mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateUserSettings', () => {
    it('should update user settings', async () => {
      const settingsRequest = {
        currencies: {
          default_currency: 'EUR',
          preferred_currencies: ['EUR', 'GBP'],
        },
        date_format: 'DD/MM/YYYY',
      };

      const mockUserData: Partial<User> = {
        id: mockUser.id,
        default_currency: 'EUR',
        preferred_currencies: ['EUR', 'GBP'],
        date_format: 'DD/MM/YYYY',
      };

      mockUsersService.updateUserSettings.mockResolvedValue(mockUserData);

      const result = await controller.updateUserSettings(
        mockUser,
        settingsRequest,
      );

      expect(result).toBeDefined();
      expect(mockUsersService.updateUserSettings).toHaveBeenCalledWith({
        userId: mockUser.id,
        dto: settingsRequest,
      });
    });
  });
});
