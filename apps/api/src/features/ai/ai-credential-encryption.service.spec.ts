import { ConfigService } from '@nestjs/config';
import { AppConfig } from 'src/configuration';
import { AiCredentialEncryptionService } from './ai-credential-encryption.service';

describe('AiCredentialEncryptionService', () => {
  it('encrypts and decrypts credentials without returning plaintext ciphertext', () => {
    const key = Buffer.alloc(32, 1).toString('base64');
    const configService = {
      get: jest.fn().mockReturnValue(key),
    } as unknown as ConfigService<AppConfig>;
    const service = new AiCredentialEncryptionService(configService);

    const encrypted = service.encrypt('sk-test-token');

    expect(encrypted).not.toBe('sk-test-token');
    expect(service.decrypt(encrypted)).toBe('sk-test-token');
  });

  it('rejects keys that are not 32 bytes', () => {
    const configService = {
      get: jest.fn().mockReturnValue('short-key'),
    } as unknown as ConfigService<AppConfig>;

    expect(() => new AiCredentialEncryptionService(configService)).toThrow(
      'DATABASE_CREDENTIALS_ENCRYPTION_KEY must decode to exactly 32 bytes',
    );
  });
});
