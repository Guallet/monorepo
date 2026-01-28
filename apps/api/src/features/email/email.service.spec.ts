import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { EmailService } from './email.service';

describe('EmailService', () => {
  let service: EmailService;
  let mockSendMail: jest.Mock;

  beforeEach(async () => {
    mockSendMail = jest
      .fn()
      .mockResolvedValue({ messageId: 'test-message-id' });

    const mockConfigService = {
      get: jest.fn(
        <T>(key: string, defaultValue?: T): T | string | number | boolean => {
          if (key === 'SMTP_HOST') return 'smtp.test.com';
          if (key === 'SMTP_PORT') return 587;
          if (key === 'SMTP_USER') return 'test-user';
          if (key === 'SMTP_PASS') return 'test-pass';
          if (key === 'SMTP_SECURE') return false;
          if (key === 'EMAIL_FROM') return 'Guallet <noreply@guallet.io>';
          return defaultValue as T;
        },
      ),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);

    // Mock the transporter.sendMail method
    service['transporter'].sendMail = mockSendMail;
  });

  describe('HTML escaping', () => {
    describe('escapeHtml', () => {
      it('should escape HTML special characters', () => {
        const result = service['escapeHtml']('<script>alert("XSS")</script>');
        expect(result).toBe(
          '&lt;script&gt;alert(&quot;XSS&quot;)&lt;&#x2F;script&gt;',
        );
      });

      it('should escape ampersands', () => {
        const result = service['escapeHtml']('Tom & Jerry');
        expect(result).toBe('Tom &amp; Jerry');
      });

      it('should escape less than and greater than signs', () => {
        const result = service['escapeHtml']('5 < 10 > 3');
        expect(result).toBe('5 &lt; 10 &gt; 3');
      });

      it('should escape quotes', () => {
        const result = service['escapeHtml']('He said "Hello"');
        expect(result).toBe('He said &quot;Hello&quot;');
      });

      it('should escape single quotes', () => {
        const result = service['escapeHtml']("It's working");
        expect(result).toBe('It&#x27;s working');
      });

      it('should escape forward slashes', () => {
        const result = service['escapeHtml']('</script>');
        expect(result).toBe('&lt;&#x2F;script&gt;');
      });

      it('should not modify safe strings', () => {
        const result = service['escapeHtml']('Normal User Name');
        expect(result).toBe('Normal User Name');
      });

      it('should handle multiple special characters', () => {
        const result = service['escapeHtml']('<div class="test">A & B</div>');
        expect(result).toBe(
          '&lt;div class=&quot;test&quot;&gt;A &amp; B&lt;&#x2F;div&gt;',
        );
      });
    });

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
          '&lt;script&gt;alert(&quot;XSS&quot;)&lt;&#x2F;script&gt;',
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
          '&lt;script&gt;alert(&quot;XSS&quot;)&lt;&#x2F;script&gt;',
        );
        expect(sendCall.html).toContain(
          '&lt;img src=x onerror=&quot;alert(1)&quot;&gt;',
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
          '&lt;&#x2F;div&gt;&lt;script&gt;malicious()&lt;&#x2F;script&gt;&lt;div&gt;',
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
        expect(sendCall.html).toContain('&lt;b&gt;Bold Name&lt;&#x2F;b&gt;');
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
          '&lt;iframe src=&quot;evil.com&quot;&gt;&lt;&#x2F;iframe&gt;',
        );
        expect(sendCall.html).toContain(
          '&lt;style&gt;body{display:none}&lt;&#x2F;style&gt;',
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
});
