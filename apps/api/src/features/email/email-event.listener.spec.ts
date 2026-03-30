import { Test, TestingModule } from '@nestjs/testing';
import { EmailEventListener } from './email-event.listener';
import { EmailService } from './email.service';

describe('EmailEventListener', () => {
  let listener: EmailEventListener;
  let emailService: jest.Mocked<EmailService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailEventListener,
        {
          provide: EmailService,
          useValue: {
            sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
            sendAuthOtpEmail: jest.fn().mockResolvedValue(undefined),
            sendAuthMagicLinkEmail: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    listener = module.get<EmailEventListener>(EmailEventListener);
    emailService = module.get(EmailService);
  });

  describe('handlePasswordReset', () => {
    it('should delegate to emailService.sendPasswordResetEmail', async () => {
      const payload = { to: 'user@example.com', url: 'https://reset.url', userName: 'Alice' };

      await listener.handlePasswordReset(payload);

      expect(emailService.sendPasswordResetEmail).toHaveBeenCalledWith(payload);
    });
  });

  describe('handleOtp', () => {
    it('should delegate to emailService.sendAuthOtpEmail', async () => {
      const payload = { to: 'user@example.com', otp: '123456', type: 'sign-in' };

      await listener.handleOtp(payload);

      expect(emailService.sendAuthOtpEmail).toHaveBeenCalledWith(payload);
    });

    it('should handle verify type', async () => {
      const payload = { to: 'user@example.com', otp: '654321', type: 'email-verification' };

      await listener.handleOtp(payload);

      expect(emailService.sendAuthOtpEmail).toHaveBeenCalledWith(payload);
    });
  });

  describe('handleMagicLink', () => {
    it('should delegate to emailService.sendAuthMagicLinkEmail', async () => {
      const payload = { to: 'user@example.com', url: 'https://magic.link' };

      await listener.handleMagicLink(payload);

      expect(emailService.sendAuthMagicLinkEmail).toHaveBeenCalledWith(payload);
    });
  });
});
