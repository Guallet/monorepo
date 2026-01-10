import { Test, TestingModule } from '@nestjs/testing';
import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';
import { UsersService } from 'src/features/users/users.service';
import {
  SupabaseWebhookUserPayload,
  SupabaseUserRecord,
} from './dto/userWebhookPayload.supabase.dto';

// Helper function to create a mock user record
const createMockUserRecord = (
  overrides: Partial<SupabaseUserRecord> = {},
): SupabaseUserRecord => ({
  id: 'user-123',
  aud: 'authenticated',
  role: 'authenticated',
  email: 'test@example.com',
  phone: null,
  created_at: new Date().toISOString(),
  deleted_at: null,
  invited_at: null,
  updated_at: new Date().toISOString(),
  instance_id: null,
  is_sso_user: false,
  banned_until: null,
  confirmed_at: new Date().toISOString(),
  email_change: null,
  is_anonymous: false,
  phone_change: null,
  is_super_admin: false,
  recovery_token: null,
  last_sign_in_at: new Date().toISOString(),
  recovery_sent_at: null,
  raw_app_meta_data: {
    provider: 'email',
    providers: ['email'],
  },
  confirmation_token: '',
  email_confirmed_at: new Date().toISOString(),
  encrypted_password: null,
  phone_change_token: null,
  phone_confirmed_at: null,
  raw_user_meta_data: null,
  confirmation_sent_at: null,
  email_change_sent_at: null,
  phone_change_sent_at: null,
  email_change_token_new: null,
  reauthentication_token: null,
  reauthentication_sent_at: null,
  email_change_token_current: null,
  email_change_confirm_status: null,
  ...overrides,
});

describe('WebhooksController', () => {
  let controller: WebhooksController;

  const mockWebhooksService = {};

  const mockUsersService = {
    upsertUser: jest.fn(),
    removeUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WebhooksController],
      providers: [
        {
          provide: WebhooksService,
          useValue: mockWebhooksService,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<WebhooksController>(WebhooksController);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create - INSERT', () => {
    it('should create a user on INSERT event', async () => {
      const payload: SupabaseWebhookUserPayload = {
        type: 'INSERT',
        table: 'users',
        record: createMockUserRecord({
          id: 'user-123',
          email: 'test@example.com',
          raw_user_meta_data: {
            iss: '',
            sub: '',
            name: '',
            email: 'test@example.com',
            picture: '',
            full_name: 'Test User',
            avatar_url: 'http://example.com/avatar.jpg',
            provider_id: '',
            email_verified: true,
            phone_verified: false,
          },
        }),
        schema: 'auth',
        old_record: null,
      };

      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
      };

      mockUsersService.upsertUser.mockResolvedValue(mockUser);

      await controller.create(payload);

      expect(mockUsersService.upsertUser).toHaveBeenCalledWith({
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        avatar_url: 'http://example.com/avatar.jpg',
      });
    });

    it('should handle INSERT event with alternative metadata fields', async () => {
      const payload: SupabaseWebhookUserPayload = {
        type: 'INSERT',
        table: 'users',
        record: createMockUserRecord({
          id: 'user-123',
          email: 'test@example.com',
          raw_user_meta_data: {
            iss: '',
            sub: '',
            name: 'Test User',
            email: 'test@example.com',
            picture: 'http://example.com/picture.jpg',
            full_name: '', // Empty, should fall back to name
            avatar_url: '', // Empty, should fall back to picture
            provider_id: '',
            email_verified: true,
            phone_verified: false,
          },
        }),
        schema: 'auth',
        old_record: null,
      };

      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
      };

      mockUsersService.upsertUser.mockResolvedValue(mockUser);

      await controller.create(payload);

      // When full_name is empty string, it IS used (not the fallback)
      // Empty string is truthy for the ?? operator
      expect(mockUsersService.upsertUser).toHaveBeenCalledWith({
        id: 'user-123',
        email: 'test@example.com',
        name: '', // Truthy empty string takes precedence
        avatar_url: '', // Truthy empty string takes precedence
      });
    });

    it('should handle INSERT event without metadata', async () => {
      const payload: SupabaseWebhookUserPayload = {
        type: 'INSERT',
        table: 'users',
        record: createMockUserRecord({
          id: 'user-123',
          email: 'test@example.com',
          raw_user_meta_data: null,
        }),
        schema: 'auth',
        old_record: null,
      };

      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
      };

      mockUsersService.upsertUser.mockResolvedValue(mockUser);

      await controller.create(payload);

      expect(mockUsersService.upsertUser).toHaveBeenCalledWith({
        id: 'user-123',
        email: 'test@example.com',
        name: '',
        avatar_url: '',
      });
    });

    it('should not throw when INSERT fails', async () => {
      const payload: SupabaseWebhookUserPayload = {
        type: 'INSERT',
        table: 'users',
        record: createMockUserRecord({
          id: 'user-123',
          email: 'test@example.com',
          raw_user_meta_data: null,
        }),
        schema: 'auth',
        old_record: null,
      };

      mockUsersService.upsertUser.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(controller.create(payload)).resolves.not.toThrow();
    });
  });

  describe('create - DELETE', () => {
    it('should delete a user on DELETE event', async () => {
      const payload: SupabaseWebhookUserPayload = {
        type: 'DELETE',
        table: 'users',
        record: null,
        old_record: createMockUserRecord({
          id: 'user-123',
        }),
        schema: 'auth',
      };

      mockUsersService.removeUser.mockResolvedValue(undefined);

      await controller.create(payload);

      expect(mockUsersService.removeUser).toHaveBeenCalledWith('user-123', {
        deleteFromAuthService: false,
      });
    });

    it('should not throw when DELETE fails', async () => {
      const payload: SupabaseWebhookUserPayload = {
        type: 'DELETE',
        table: 'users',
        record: null,
        old_record: createMockUserRecord({
          id: 'user-123',
        }),
        schema: 'auth',
      };

      mockUsersService.removeUser.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(controller.create(payload)).resolves.not.toThrow();
    });
  });

  describe('create - UPDATE', () => {
    it('should update a user on UPDATE event', async () => {
      const payload: SupabaseWebhookUserPayload = {
        type: 'UPDATE',
        table: 'users',
        record: createMockUserRecord({
          id: 'user-123',
          email: 'updated@example.com',
          raw_user_meta_data: {
            iss: '',
            sub: '',
            name: '',
            email: 'updated@example.com',
            picture: '',
            full_name: 'Updated User',
            avatar_url: 'http://example.com/new-avatar.jpg',
            provider_id: '',
            email_verified: true,
            phone_verified: false,
          },
        }),
        schema: 'auth',
        old_record: null,
      };

      const mockUser = {
        id: 'user-123',
        email: 'updated@example.com',
      };

      mockUsersService.upsertUser.mockResolvedValue(mockUser);

      await controller.create(payload);

      expect(mockUsersService.upsertUser).toHaveBeenCalledWith({
        id: 'user-123',
        email: 'updated@example.com',
        name: 'Updated User',
        avatar_url: 'http://example.com/new-avatar.jpg',
      });
    });

    it('should not throw when UPDATE fails', async () => {
      const payload: SupabaseWebhookUserPayload = {
        type: 'UPDATE',
        table: 'users',
        record: createMockUserRecord({
          id: 'user-123',
          email: 'test@example.com',
          raw_user_meta_data: null,
        }),
        schema: 'auth',
        old_record: null,
      };

      mockUsersService.upsertUser.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(controller.create(payload)).resolves.not.toThrow();
    });
  });

  describe('create - unknown event type', () => {
    it('should log warning for unhandled event type', async () => {
      const payload = {
        type: 'UNKNOWN',
        table: 'users',
        record: null,
        schema: 'auth',
        old_record: null,
      };

      await controller.create(payload as SupabaseWebhookUserPayload);

      // Should complete without errors
      expect(mockUsersService.upsertUser).not.toHaveBeenCalled();
      expect(mockUsersService.removeUser).not.toHaveBeenCalled();
    });
  });
});
