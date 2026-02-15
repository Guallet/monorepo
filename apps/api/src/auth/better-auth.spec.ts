/* eslint-disable @typescript-eslint/no-unsafe-return */
import { createAuth } from './better-auth';
import { betterAuth } from 'better-auth';
import { EmailService } from 'src/features/email/email.service';
import { UsersService } from 'src/features/users/users.service';

jest.mock('better-auth', () => ({
  betterAuth: jest.fn((config) => config),
}));

jest.mock('better-auth/plugins', () => ({
  emailOTP: jest.fn((config) => ({ name: 'emailOTP', ...config })),
  magicLink: jest.fn((config) => ({ name: 'magicLink', ...config })),
}));

describe('createAuth', () => {
  const databaseConfig = {
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'postgres',
    database: 'guallet',
    ssl: false,
  };

  const authConfig = {
    secret: 'test-secret',
    baseUrl: 'http://localhost:3000',
    allowedOrigins: ['http://localhost:5173'],
    socialProviders: {
      google: {
        clientId: 'client-id',
        clientSecret: 'client-secret',
      },
    },
  };

  const emailService = {
    sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
    sendAuthOtpEmail: jest.fn().mockResolvedValue(undefined),
    sendAuthMagicLinkEmail: jest.fn().mockResolvedValue(undefined),
  } as unknown as Pick<
    EmailService,
    'sendPasswordResetEmail' | 'sendAuthOtpEmail' | 'sendAuthMagicLinkEmail'
  >;

  const usersService = {
    enqueueUserCreatedEvent: jest.fn().mockResolvedValue(undefined),
  } as unknown as Pick<UsersService, 'enqueueUserCreatedEvent'>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call usersService.enqueueUserCreatedEvent from database hook when user is created', async () => {
    createAuth({
      databaseConfig,
      authConfig,
      emailService: emailService as unknown as EmailService,
      usersService: usersService as unknown as UsersService,
    });

    expect(betterAuth).toHaveBeenCalledTimes(1);

    const config = (betterAuth as jest.Mock).mock.calls[0][0];
    await config.databaseHooks.user.create.after({ id: 'user-123' });

    expect(usersService.enqueueUserCreatedEvent).toHaveBeenCalledWith(
      'user-123',
    );
  });

  it('should not call enqueueUserCreatedEvent when user id is missing', async () => {
    createAuth({
      databaseConfig,
      authConfig,
      emailService: emailService as unknown as EmailService,
      usersService: usersService as unknown as UsersService,
    });

    const config = (betterAuth as jest.Mock).mock.calls[0][0];
    await config.databaseHooks.user.create.after({});

    expect(usersService.enqueueUserCreatedEvent).not.toHaveBeenCalled();
  });
});
