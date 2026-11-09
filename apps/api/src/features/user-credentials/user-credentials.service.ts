import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { UserCredential } from './entities/user-credential.entity';
import type { CredentialOwner, StoredCredentials } from './types';
import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import { AppConfig } from 'src/configuration';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;
const KEY_LENGTH = 32;

@Injectable()
export class UserCredentialsService {
  private readonly key: Buffer;

  constructor(
    configService: ConfigService<AppConfig>,
    @InjectRepository(UserCredential)
    private readonly credentials: Repository<UserCredential>,
  ) {
    const configuredKey =
      configService.get('userCredentials.encryptionKey', { infer: true }) ?? '';
    this.key = this.parseKey(configuredKey);
  }

  async getCredentials(
    owner: CredentialOwner,
    manager?: EntityManager,
  ): Promise<StoredCredentials> {
    const credential = await this.repository(manager).findOne({
      where: { user_id: owner.userId, key: owner.key },
      select: {
        id: true,
        encrypted_credentials: true,
        hint: true,
        version: true,
      },
      lock: manager ? { mode: 'pessimistic_read' } : undefined,
    });
    if (!credential) throw new NotFoundException('Credentials not found');
    return {
      id: credential.id,
      value: this.decrypt(credential.encrypted_credentials),
      hint: credential.hint,
      version: credential.version,
    };
  }

  async getCredentialMetadata(
    owner: CredentialOwner,
    manager?: EntityManager,
  ): Promise<UserCredential | null> {
    return await this.repository(manager).findOne({
      where: { user_id: owner.userId, key: owner.key },
    });
  }

  async setCredentials(
    owner: CredentialOwner,
    value: string,
    hint: string | null,
    manager?: EntityManager,
  ): Promise<void> {
    await this.repository(manager).query(
      `INSERT INTO "user_credentials"
        ("user_id", "key", "encrypted_credentials", "hint", "version")
        VALUES ($1, $2, $3, $4, 1)
        ON CONFLICT ("user_id", "key") DO UPDATE SET
          "encrypted_credentials" = EXCLUDED."encrypted_credentials",
          "hint" = EXCLUDED."hint",
          "version" = "user_credentials"."version" + 1,
          "updated_at" = CURRENT_TIMESTAMP,
          "deleted_at" = NULL`,
      [owner.userId, owner.key, this.encrypt(value), hint],
    );
  }

  async removeCredentials(
    owner: CredentialOwner,
    manager?: EntityManager,
  ): Promise<void> {
    await this.repository(manager).delete({
      user_id: owner.userId,
      key: owner.key,
    });
  }

  private repository(manager?: EntityManager): Repository<UserCredential> {
    return manager?.getRepository(UserCredential) ?? this.credentials;
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
    const key = Buffer.from(configuredKey, 'base64');

    if (key.length !== KEY_LENGTH) {
      throw new InternalServerErrorException(
        'DATABASE_CREDENTIALS_ENCRYPTION_KEY must be a base64 string that decodes to exactly 32 bytes (generate one with `openssl rand -base64 32`)',
      );
    }

    return key;
  }
}
