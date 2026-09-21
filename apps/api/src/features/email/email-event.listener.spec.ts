import { Test, TestingModule } from '@nestjs/testing';
import type { Mock } from 'vitest';
import { EmailEventListener } from './email-event.listener';
import { EmailService } from './email.service';

describe('EmailEventListener', () => {
  let listener: EmailEventListener;
  let mockSendPasswordResetEmail: Mock;
  let mockSendAuthOtpEmail: Mock;
  let mockSendAuthMagicLinkEmail: Mock;
  let mockSendWelcomeEmail: Mock;

  beforeEach(async () => {
    mockSendPasswordResetEmail = vi.fn().mockResolvedValue(undefined);
    mockSendAuthOtpEmail = vi.fn().mockResolvedValue(undefined);
    mockSendAuthMagicLinkEmail = vi.fn().mockResolvedValue(undefined);
    mockSendWelcomeEmail = vi.fn().mockResolvedValue(undefined);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailEventListener,
        {
          provide: EmailService,
          useValue: {
            sendPasswordResetEmail: mockSendPasswordResetEmail,
            sendAuthOtpEmail: mockSendAuthOtpEmail,
            sendAuthMagicLinkEmail: mockSendAuthMagicLinkEmail,
            sendWelcomeEmail: mockSendWelcomeEmail,
          },
        },
      ],
    }).compile();

    listener = module.get<EmailEventListener>(EmailEventListener);
  });

  describe('handlePasswordReset', () => {
    it('should delegate to emailService.sendPasswordResetEmail', async () => {
      const payload = {
        to: 'user@example.com',
        url: 'https://reset.url',
        userName: 'Alice',
      };

      await listener.handlePasswordReset(payload);

      expect(mockSendPasswordResetEmail).toHaveBeenCalledWith(payload);
    });
  });

  describe('handleOtp', () => {
    it('should delegate to emailService.sendAuthOtpEmail', async () => {
      const payload = {
        to: 'user@example.com',
        otp: '123456',
        type: 'sign-in',
      };

      await listener.handleOtp(payload);

      expect(mockSendAuthOtpEmail).toHaveBeenCalledWith(payload);
    });

    it('should handle verify type', async () => {
      const payload = {
        to: 'user@example.com',
        otp: '654321',
        type: 'email-verification',
      };

      await listener.handleOtp(payload);

      expect(mockSendAuthOtpEmail).toHaveBeenCalledWith(payload);
    });
  });

  describe('handleMagicLink', () => {
    it('should delegate to emailService.sendAuthMagicLinkEmail', async () => {
      const payload = { to: 'user@example.com', url: 'https://magic.link' };

      await listener.handleMagicLink(payload);

      expect(mockSendAuthMagicLinkEmail).toHaveBeenCalledWith(payload);
    });
  });

  describe('handleUserCreated', () => {
    it('should send a welcome email using the event payload', async () => {
      const payload = {
        userId: 'user-123',
        email: 'user@example.com',
        userName: 'Alice',
      };

      await listener.handleUserCreated(payload);

      expect(mockSendWelcomeEmail).toHaveBeenCalledWith({
        to: payload.email,
        userName: payload.userName,
      });
    });

    it('should use a fallback name when the event has no name', async () => {
      await listener.handleUserCreated({
        userId: 'user-123',
        email: 'user@example.com',
      });

      expect(mockSendWelcomeEmail).toHaveBeenCalledWith({
        to: 'user@example.com',
        userName: 'there',
      });
    });
  });
});
