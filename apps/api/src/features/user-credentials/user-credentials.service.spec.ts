import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserCredential } from './entities/user-credential.entity';
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
    const service = new UserCredentialsService(createConfig(), {} as never);
    const settings = JSON.stringify({ apiKey: 'user-setting-secret' });

    const encrypted = service.encrypt(settings);

    expect(encrypted).not.toBe(settings);
    expect(service.decrypt(encrypted)).toBe(settings);
  });

  it('decrypts credentials in the existing AI encryption format', () => {
    const service = new UserCredentialsService(createConfig(), {} as never);
    const encrypted =
      'AgICAgICAgICAgICRLTdpeDtKXj7lzmFlXzSMmKuoDo+Pq+a/rzOpyrOptfQmKWAgNTj';

    expect(service.decrypt(encrypted)).toBe('existing-provider-token');
  });

  it('can be imported without the AI module', async () => {
    const module = await Test.createTestingModule({
      imports: [UserCredentialsModule],
    })
      .overrideProvider(getRepositoryToken(UserCredential))
      .useValue({})
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
    expect(
      () => new UserCredentialsService(createConfig('short-key'), {} as never),
    ).toThrow(
      'DATABASE_CREDENTIALS_ENCRYPTION_KEY must be a base64 string that decodes to exactly 32 bytes',
    );
  });

  it('rejects raw 32-character strings that are not base64-encoded keys', () => {
    expect(
      () =>
        new UserCredentialsService(createConfig('a'.repeat(32)), {} as never),
    ).toThrow(
      'DATABASE_CREDENTIALS_ENCRYPTION_KEY must be a base64 string that decodes to exactly 32 bytes',
    );
  });
});

describe('keyed credential storage', () => {
  const owner = { userId: 'user', key: 'settings:secret' };
  it('retrieves and decrypts only the requested user/key credentials', async () => {
    const repository = { findOne: vi.fn() };
    const service = new UserCredentialsService(
      createConfig(),
      repository as never,
    );
    repository.findOne.mockResolvedValue({
      id: 'credential',
      encrypted_credentials: service.encrypt('stored-value'),
      hint: 'alue',
      version: 3,
    });
    expect(await service.getCredentials(owner)).toEqual({
      id: 'credential',
      value: 'stored-value',
      hint: 'alue',
      version: 3,
    });
    expect(repository.findOne).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { user_id: 'user', key: 'settings:secret' },
        select: expect.objectContaining({ encrypted_credentials: true }),
      }),
    );
  });
  it('fails when credentials are absent', async () => {
    const repository = { findOne: vi.fn().mockResolvedValue(null) };
    const service = new UserCredentialsService(
      createConfig(),
      repository as never,
    );
    await expect(service.getCredentials(owner)).rejects.toThrow(
      'Credentials not found',
    );
  });
  it('gets metadata without selecting ciphertext', async () => {
    const repository = {
      findOne: vi.fn().mockResolvedValue({ version: 2, hint: 'hint' }),
    };
    const service = new UserCredentialsService(
      createConfig(),
      repository as never,
    );
    expect(await service.getCredentialMetadata(owner)).toEqual({
      version: 2,
      hint: 'hint',
    });
    expect(repository.findOne).toHaveBeenCalledWith({
      where: { user_id: 'user', key: 'settings:secret' },
    });
  });
  it('removes only credentials for the requested user and key', async () => {
    const repository = { delete: vi.fn().mockResolvedValue({ affected: 1 }) };
    const service = new UserCredentialsService(
      createConfig(),
      repository as never,
    );
    await service.removeCredentials(owner);
    expect(repository.delete).toHaveBeenCalledWith({
      user_id: 'user',
      key: 'settings:secret',
    });
  });
});
