import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { AppConfig } from 'src/configuration';
import { UserCredentialsModule } from './user-credentials.module';
import { UserCredentialsService } from './user-credentials.service';

const key = Buffer.alloc(32, 1).toString('base64');

function createConfig(encryptionKey = key): ConfigService<AppConfig> {
  return new ConfigService<AppConfig>({
    userCredentials: { encryptionKey },
  });
}

describe('UserCredentialsService', () => {
  it('encrypts and decrypts user settings without returning plaintext ciphertext', () => {
    const service = new UserCredentialsService(createConfig());
    const settings = JSON.stringify({ apiKey: 'user-setting-secret' });

    const encrypted = service.encrypt(settings);

    expect(encrypted).not.toBe(settings);
    expect(service.decrypt(encrypted)).toBe(settings);
  });

  it('decrypts credentials in the existing AI encryption format', () => {
    const service = new UserCredentialsService(createConfig());
    const encrypted =
      'AgICAgICAgICAgICRLTdpeDtKXj7lzmFlXzSMmKuoDo+Pq+a/rzOpyrOptfQmKWAgNTj';

    expect(service.decrypt(encrypted)).toBe('existing-provider-token');
  });

  it('can be imported without the AI module', async () => {
    const module = await Test.createTestingModule({
      imports: [UserCredentialsModule],
    })
      .overrideProvider(ConfigService)
      .useValue(createConfig())
      .compile();

    try {
      const service = module.get(UserCredentialsService);

      expect(service.decrypt(service.encrypt('bank-api-key'))).toBe(
        'bank-api-key',
      );
    } finally {
      await module.close();
    }
  });

  it('rejects keys that are not 32 bytes', () => {
    expect(() => new UserCredentialsService(createConfig('short-key'))).toThrow(
      'DATABASE_CREDENTIALS_ENCRYPTION_KEY must be a base64 string that decodes to exactly 32 bytes',
    );
  });

  it('rejects raw 32-character strings that are not base64-encoded keys', () => {
    expect(
      () => new UserCredentialsService(createConfig('a'.repeat(32))),
    ).toThrow(
      'DATABASE_CREDENTIALS_ENCRYPTION_KEY must be a base64 string that decodes to exactly 32 bytes',
    );
  });
});
