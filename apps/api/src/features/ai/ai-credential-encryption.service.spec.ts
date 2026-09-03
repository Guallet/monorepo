import { ConfigService } from '@nestjs/config';
import { AppConfig } from '../../configuration.js';
import { AiCredentialEncryptionService } from './ai-credential-encryption.service.js';

describe('AiCredentialEncryptionService', () => {
  it('encrypts and decrypts credentials without returning plaintext ciphertext', () => {
    const key = Buffer.alloc(32, 1).toString('base64');
    const configService = {
      get: vi.fn().mockReturnValue(key),
    } as unknown as ConfigService<AppConfig>;
    const service = new AiCredentialEncryptionService(configService);

    const encrypted = service.encrypt('sk-test-token');

    expect(encrypted).not.toBe('sk-test-token');
    expect(service.decrypt(encrypted)).toBe('sk-test-token');
  });

  it('rejects keys that are not 32 bytes', () => {
    const configService = {
      get: vi.fn().mockReturnValue('short-key'),
    } as unknown as ConfigService<AppConfig>;

    expect(() => new AiCredentialEncryptionService(configService)).toThrow(
      'DATABASE_CREDENTIALS_ENCRYPTION_KEY must be a base64 string that decodes to exactly 32 bytes',
    );
  });

  it('rejects raw 32-character strings that are not base64-encoded keys', () => {
    const configService = {
      get: vi.fn().mockReturnValue('a'.repeat(32)),
    } as unknown as ConfigService<AppConfig>;

    expect(() => new AiCredentialEncryptionService(configService)).toThrow(
      'DATABASE_CREDENTIALS_ENCRYPTION_KEY must be a base64 string that decodes to exactly 32 bytes',
    );
  });
});
