import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import { AppConfig } from 'src/configuration';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;
const KEY_LENGTH = 32;

@Injectable()
export class AiCredentialEncryptionService {
  private readonly key: Buffer;

  constructor(configService: ConfigService<AppConfig>) {
    const configuredKey =
      configService.get('ai.credentialsEncryptionKey', { infer: true }) ?? '';
    this.key = this.parseKey(configuredKey);
  }

  encrypt(plaintext: string): string {
    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv(ALGORITHM, this.key, iv, {
      authTagLength: AUTH_TAG_LENGTH,
    });
    const ciphertext = Buffer.concat([
      cipher.update(plaintext, 'utf8'),
      cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();

    return Buffer.concat([iv, authTag, ciphertext]).toString('base64');
  }

  decrypt(encrypted: string): string {
    const payload = Buffer.from(encrypted, 'base64');
    const iv = payload.subarray(0, IV_LENGTH);
    const authTag = payload.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
    const ciphertext = payload.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

    const decipher = createDecipheriv(ALGORITHM, this.key, iv, {
      authTagLength: AUTH_TAG_LENGTH,
    });
    decipher.setAuthTag(authTag);

    return Buffer.concat([
      decipher.update(ciphertext),
      decipher.final(),
    ]).toString('utf8');
  }

  private parseKey(configuredKey: string): Buffer {
    const keyCandidates = [
      Buffer.from(configuredKey, 'base64'),
      Buffer.from(configuredKey, 'hex'),
      Buffer.from(configuredKey, 'utf8'),
    ];
    const key = keyCandidates.find(
      (candidate) => candidate.length === KEY_LENGTH,
    );

    if (!key) {
      throw new InternalServerErrorException(
        'DATABASE_CREDENTIALS_ENCRYPTION_KEY must decode to exactly 32 bytes',
      );
    }

    return key;
  }
}
