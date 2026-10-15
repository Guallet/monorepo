import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import type { Mock } from 'vitest';
import { EmailService } from './email.service';
import { EmailConfig } from 'src/configuration';

describe('EmailService', () => {
  let service: EmailService;
  let mockSendMail: Mock;

  const createMockConfigService = (smtpHost?: string) => ({
    get: vi.fn(<T>(key: string, defaultValue?: T): T | undefined => {
      if (key === 'email') {
        const emailConfig: EmailConfig = {
          from: 'Guallet <noreply@guallet.io>',
          smtp: {
            host: smtpHost || '',
            port: 587,
            user: 'test-user',
            pass: 'test-pass',
            secure: true,
          },
        };

        return emailConfig as T;
      }
      return defaultValue;
    }),
  });

  beforeEach(async () => {
    mockSendMail = vi.fn().mockResolvedValue({ messageId: 'test-message-id' });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: ConfigService,
          useValue: createMockConfigService('smtp.test.com'),
        },
      ],
    }).compile();

    await module.init();
    service = module.get<EmailService>(EmailService);

    // Mock the transporter.sendMail method if transporter exists
    if (service['transporter']) {
      service['transporter'].sendMail = mockSendMail;
    }
  });

  describe('delivery diagnostics', () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('logs the attempt before SMTP resolves and correlates acceptance', async () => {
      const log = vi
        .spyOn(service['logger'], 'log')
        .mockImplementation(() => {});
      let resolveSend!: (result: { messageId: string }) => void;
      mockSendMail.mockReturnValueOnce(
        new Promise((resolve) => {
          resolveSend = resolve;
        }),
      );

      const sending = service.sendWelcomeEmail({
        to: 'test@example.com',
        userName: 'Test User',
      });

      expect(log).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Email send attempt started',
          attemptId: expect.any(String),
          template: 'welcome',
          smtpHost: 'smtp.test.com',
          smtpPort: 587,
          smtpSecure: true,
          smtpAuthConfigured: true,
        }),
      );
      expect(log).toHaveBeenCalledTimes(1);
      const attemptId = log.mock.calls[0][0].attemptId;

      resolveSend({ messageId: 'smtp-message-id' });
      await sending;

      expect(log).toHaveBeenLastCalledWith(
        expect.objectContaining({
          message: 'Email accepted by SMTP server',
          attemptId,
          messageId: 'smtp-message-id',
          durationMs: expect.any(Number),
        }),
      );
    });

    it('logs SMTP rejection details without credentials or email content', async () => {
      const log = vi
        .spyOn(service['logger'], 'log')
        .mockImplementation(() => {});
      const errorLog = vi
        .spyOn(service['logger'], 'error')
        .mockImplementation(() => {});
      mockSendMail.mockRejectedValueOnce(
        Object.assign(new Error('Authentication failed: test-pass'), {
          code: 'EAUTH',
          command: 'AUTH PLAIN',
          responseCode: 535,
          response: '535 Invalid credentials: test-pass',
          auth: { user: 'test-user', pass: 'test-pass' },
          html: 'private-email-body',
        }),
      );

      await expect(
        service.sendAuthOtpEmail({
          to: 'private@example.com',
          otp: 'secret-otp',
          type: 'sign-in',
        }),
      ).resolves.toBeUndefined();

      expect(errorLog).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Email send attempt failed',
          attemptId: log.mock.calls[0][0].attemptId,
          template: 'auth-otp',
          stage: 'smtp',
          durationMs: expect.any(Number),
          error: {
            name: 'Error',
            message: 'Authentication failed: [REDACTED]',
            code: 'EAUTH',
            command: 'AUTH PLAIN',
            responseCode: 535,
            response: '535 Invalid credentials: [REDACTED]',
          },
        }),
      );
      const output = JSON.stringify([
        ...log.mock.calls,
        ...errorLog.mock.calls,
      ]);
      for (const secret of [
        'test-user',
        'test-pass',
        'private@example.com',
        'secret-otp',
        'private-email-body',
      ]) {
        expect(output).not.toContain(secret);
      }
    });

    it('distinguishes template errors from SMTP failures', async () => {
      const errorLog = vi
        .spyOn(service['logger'], 'error')
        .mockImplementation(() => {});
      service['compiledTemplates'].delete('welcome');

      await service.sendWelcomeEmail({
        to: 'test@example.com',
        userName: 'Test User',
      });

      expect(mockSendMail).not.toHaveBeenCalled();
      expect(errorLog).toHaveBeenCalledWith(
        expect.objectContaining({
          stage: 'render',
          error: { name: 'Error', message: 'Template welcome not found' },
        }),
      );
    });

    it('logs skipped email attempts when SMTP is unavailable', async () => {
      const warn = vi
        .spyOn(service['logger'], 'warn')
        .mockImplementation(() => {});
      service['transporter'] = null;

      await service.sendWelcomeEmail({
        to: 'test@example.com',
        userName: 'Test User',
      });

      expect(mockSendMail).not.toHaveBeenCalled();
      expect(warn).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Email not sent - SMTP not configured',
          attemptId: expect.any(String),
          template: 'welcome',
        }),
      );
    });

    it('handles non-Error rejections without changing caller behavior', async () => {
      const errorLog = vi
        .spyOn(service['logger'], 'error')
        .mockImplementation(() => {});
      mockSendMail.mockRejectedValueOnce('SMTP unavailable');

      await expect(
        service.sendWelcomeEmail({
          to: 'test@example.com',
          userName: 'Test User',
        }),
      ).resolves.toBeUndefined();

      expect(errorLog).toHaveBeenCalledWith(
        expect.objectContaining({
          stage: 'smtp',
          error: { message: 'SMTP unavailable' },
        }),
      );
    });
  });

  describe('HTML escaping', () => {
    describe('sendImportCompletionEmail', () => {
      it('should escape userName in HTML content', async () => {
        const maliciousUserName = '<script>alert("XSS")</script>';

        await service.sendImportCompletionEmail({
          to: 'test@example.com',
          userName: maliciousUserName,
          processedCount: 10,
          failedCount: 0,
        });

        const sendCall = mockSendMail.mock.calls[0][0];
        expect(sendCall.html).toContain(
          '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;',
        );
        expect(sendCall.html).not.toContain('<script>alert("XSS")</script>');
      });

      it('should handle userName with ampersands', async () => {
        await service.sendImportCompletionEmail({
          to: 'test@example.com',
          userName: 'Tom & Jerry',
          processedCount: 5,
          failedCount: 0,
        });

        const sendCall = mockSendMail.mock.calls[0][0];
        expect(sendCall.html).toContain('Tom &amp; Jerry');
      });

      it('should handle userName with quotes', async () => {
        await service.sendImportCompletionEmail({
          to: 'test@example.com',
          userName: 'User "Nickname"',
          processedCount: 5,
          failedCount: 0,
        });

        const sendCall = mockSendMail.mock.calls[0][0];
        expect(sendCall.html).toContain('User &quot;Nickname&quot;');
      });
    });

    describe('sendImportErrorEmail', () => {
      it('should escape userName and errorMessage in HTML content', async () => {
        const maliciousUserName = '<script>alert("XSS")</script>';
        const maliciousError = '<img src=x onerror="alert(1)">';

        await service.sendImportErrorEmail({
          to: 'test@example.com',
          userName: maliciousUserName,
          errorMessage: maliciousError,
        });

        const sendCall = mockSendMail.mock.calls[0][0];
        expect(sendCall.html).toContain(
          '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;',
        );
        expect(sendCall.html).toContain(
          '&lt;img src&#x3D;x onerror&#x3D;&quot;alert(1)&quot;&gt;',
        );
        expect(sendCall.html).not.toContain('<script>');
        expect(sendCall.html).not.toContain('<img');
      });

      it('should handle errorMessage with special characters', async () => {
        await service.sendImportErrorEmail({
          to: 'test@example.com',
          userName: 'John Doe',
          errorMessage: 'Error: 5 < 10 & "parsing failed"',
        });

        const sendCall = mockSendMail.mock.calls[0][0];
        expect(sendCall.html).toContain(
          'Error: 5 &lt; 10 &amp; &quot;parsing failed&quot;',
        );
      });

      it('should prevent HTML injection in error messages', async () => {
        await service.sendImportErrorEmail({
          to: 'test@example.com',
          userName: 'Test User',
          errorMessage: '</div><script>malicious()</script><div>',
        });

        const sendCall = mockSendMail.mock.calls[0][0];
        expect(sendCall.html).toContain(
          '&lt;/div&gt;&lt;script&gt;malicious()&lt;/script&gt;&lt;div&gt;',
        );
      });
    });

    describe('sendExportCompletionEmail', () => {
      it('should escape userName in HTML content', async () => {
        const maliciousUserName = '<b>Bold Name</b>';

        await service.sendExportCompletionEmail({
          to: 'test@example.com',
          userName: maliciousUserName,
          transactionCount: 100,
          csvContent: 'date,amount\n2024-01-01,100',
        });

        const sendCall = mockSendMail.mock.calls[0][0];
        expect(sendCall.html).toContain('&lt;b&gt;Bold Name&lt;/b&gt;');
        expect(sendCall.html).not.toContain('<b>Bold Name</b>');
      });

      it('should handle userName with special characters', async () => {
        await service.sendExportCompletionEmail({
          to: 'test@example.com',
          userName: "O'Brien & Associates",
          transactionCount: 50,
          csvContent: 'date,amount\n2024-01-01,100',
        });

        const sendCall = mockSendMail.mock.calls[0][0];
        expect(sendCall.html).toContain('O&#x27;Brien &amp; Associates');
      });
    });

    describe('sendExportErrorEmail', () => {
      it('should escape userName and errorMessage in HTML content', async () => {
        const maliciousUserName = '<iframe src="evil.com"></iframe>';
        const maliciousError = '<style>body{display:none}</style>';

        await service.sendExportErrorEmail({
          to: 'test@example.com',
          userName: maliciousUserName,
          errorMessage: maliciousError,
        });

        const sendCall = mockSendMail.mock.calls[0][0];
        expect(sendCall.html).toContain(
          '&lt;iframe src&#x3D;&quot;evil.com&quot;&gt;&lt;/iframe&gt;',
        );
        expect(sendCall.html).toContain(
          '&lt;style&gt;body{display:none}&lt;/style&gt;',
        );
        // Verify the malicious content is escaped, not rendered as HTML
        expect(sendCall.html).toContain('Hello &lt;iframe');
        expect(sendCall.html).toContain('<p>&lt;style&gt;');
      });

      it('should handle complex error messages with mixed characters', async () => {
        await service.sendExportErrorEmail({
          to: 'test@example.com',
          userName: 'Test User',
          errorMessage:
            'Database error: "Connection timeout" & query failed: SELECT * FROM users WHERE id < 100',
        });

        const sendCall = mockSendMail.mock.calls[0][0];
        expect(sendCall.html).toContain(
          'Database error: &quot;Connection timeout&quot; &amp; query failed: SELECT * FROM users WHERE id &lt; 100',
        );
      });
    });
  });

  describe('email sending', () => {
    it('should send import completion email with correct parameters', async () => {
      await service.sendImportCompletionEmail({
        to: 'test@example.com',
        userName: 'John Doe',
        processedCount: 10,
        failedCount: 2,
      });

      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          from: 'Guallet <noreply@guallet.io>',
          to: 'test@example.com',
          subject: 'CSV Import Complete',
          html: expect.stringContaining('John Doe'),
        }),
      );
    });

    it('should send export completion email with CSV attachment', async () => {
      const csvContent = 'date,amount\n2024-01-01,100';

      await service.sendExportCompletionEmail({
        to: 'test@example.com',
        userName: 'Jane Doe',
        transactionCount: 50,
        csvContent,
      });

      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          from: 'Guallet <noreply@guallet.io>',
          to: 'test@example.com',
          subject: 'Your Data Export is Ready',
          html: expect.stringContaining('Jane Doe'),
          attachments: expect.arrayContaining([
            expect.objectContaining({
              filename: expect.stringMatching(/guallet-export-.*\.csv/),
              content: expect.any(String),
            }),
          ]),
        }),
      );
    });

    it('should send a welcome email', async () => {
      await service.sendWelcomeEmail({
        to: 'new-user@example.com',
        userName: 'New User',
      });

      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          from: 'Guallet <noreply@guallet.io>',
          to: 'new-user@example.com',
          subject: 'Welcome to Guallet',
          html: expect.stringContaining('New User'),
        }),
      );
    });

    it('should handle SMTP errors gracefully', async () => {
      mockSendMail.mockRejectedValueOnce(new Error('SMTP Error'));

      // Should not throw
      await expect(
        service.sendImportCompletionEmail({
          to: 'test@example.com',
          userName: 'Test User',
          processedCount: 5,
          failedCount: 0,
        }),
      ).resolves.not.toThrow();
    });

    it('should handle email send failures gracefully', async () => {
      mockSendMail.mockRejectedValueOnce(new Error('Network error'));

      // Should not throw
      await expect(
        service.sendExportErrorEmail({
          to: 'test@example.com',
          userName: 'Test User',
          errorMessage: 'Some error',
        }),
      ).resolves.not.toThrow();
    });
  });

  describe('SMTP not configured', () => {
    let serviceWithoutSmtp: EmailService;

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          EmailService,
          {
            provide: ConfigService,
            useValue: createMockConfigService(),
          },
        ],
      }).compile();

      await module.init();
      serviceWithoutSmtp = module.get<EmailService>(EmailService);
    });

    it('should not attempt to send email when SMTP is not configured', async () => {
      await serviceWithoutSmtp.sendImportCompletionEmail({
        to: 'test@example.com',
        userName: 'Test User',
        processedCount: 10,
        failedCount: 0,
      });

      // transporter should be null, so no sendMail call should happen
      expect(serviceWithoutSmtp['transporter']).toBeNull();
    });

    it('should gracefully handle sendExportCompletionEmail when SMTP is not configured', async () => {
      await expect(
        serviceWithoutSmtp.sendExportCompletionEmail({
          to: 'test@example.com',
          userName: 'Test User',
          transactionCount: 100,
          csvContent: 'date,amount\n2024-01-01,100',
        }),
      ).resolves.not.toThrow();
    });
  });
});
