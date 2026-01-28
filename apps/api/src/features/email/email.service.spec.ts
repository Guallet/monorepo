import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { EmailService } from './email.service';

describe('EmailService', () => {
  let service: EmailService;
  let mockSendMail: jest.Mock;

  const createMockConfigService = (smtpHost?: string) => ({
    get: jest.fn(<T>(key: string, defaultValue?: T): T | undefined => {
      const config: Record<string, unknown> = {
        SMTP_HOST: smtpHost,
        SMTP_PORT: 587,
        SMTP_USER: smtpHost ? 'test-user' : undefined,
        SMTP_PASS: smtpHost ? 'test-pass' : undefined,
        SMTP_SECURE: false,
        EMAIL_FROM: 'Guallet <noreply@guallet.io>',
      };
      return (config[key] as T) ?? defaultValue;
    }),
  });

  beforeEach(async () => {
    mockSendMail = jest
      .fn()
      .mockResolvedValue({ messageId: 'test-message-id' });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: ConfigService,
          useValue: createMockConfigService('smtp.test.com'),
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);

    // Mock the transporter.sendMail method
    service['transporter']!.sendMail = mockSendMail;
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
            useValue: createMockConfigService(undefined),
          },
        ],
      }).compile();

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
