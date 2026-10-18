import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CredentialEncryptionService } from 'src/common/crypto/credential-encryption.service';
import { DecisionConnection } from './entities/decision-connection.entity';
import {
  CreateDecisionConnectionDto,
  UpdateDecisionConnectionDto,
  DecisionConnectionDto,
} from './dto/classification.dto';
import { JevClient, Credentials, authHeaders } from './jev-client.service';
import { DecisionError, SafeHttpClient } from './http/safe-http-client';
import { ClassificationLimits } from './classification-limits.service';

@Injectable()
export class DecisionConnectionsService {
  constructor(
    private readonly db: DataSource,
    private readonly cipher: CredentialEncryptionService,
    private readonly http: SafeHttpClient,
    private readonly client: JevClient,
    private readonly limits: ClassificationLimits,
  ) {}
  async get({
    userId,
    secrets = false,
  }: {
    userId: string;
    secrets?: boolean;
  }) {
    const query = this.db
      .getRepository(DecisionConnection)
      .createQueryBuilder('connection')
      .where('connection.user_id = :userId', { userId });
    if (secrets) query.addSelect('connection.encrypted_credentials');
    return query.getOne();
  }
  toDto(c: DecisionConnection): DecisionConnectionDto {
    return {
      id: c.id,
      displayName: c.display_name,
      baseUrl: c.base_url,
      model: c.model,
      authType: c.auth_type,
      authHeaderName: c.auth_header_name,
      hasCredentials: c.credential_hint !== null,
      credentialHint: c.credential_hint,
      minConfidence: c.min_confidence,
      minMargin: c.min_margin,
      sendNotes: c.send_notes,
      isActive: c.is_active,
      lastTestStatus: c.last_test_status,
      lastTestAt: c.last_test_at,
    };
  }
  credentials(c: DecisionConnection): Credentials {
    return c.encrypted_credentials
      ? (JSON.parse(
          this.cipher.decrypt(c.encrypted_credentials),
        ) as Credentials)
      : {};
  }
  private merge(
    userId: string,
    dto: CreateDecisionConnectionDto | UpdateDecisionConnectionDto,
    existing?: DecisionConnection | null,
  ) {
    const c = this.db.getRepository(DecisionConnection).create({
      ...existing,
      user_id: userId,
      display_name: dto.displayName ?? existing?.display_name,
      base_url: dto.baseUrl ?? existing?.base_url,
      model: dto.model ?? existing?.model ?? 'jev-latest',
      auth_type: dto.authType ?? existing?.auth_type ?? 'none',
      auth_header_name:
        dto.authHeaderName ?? existing?.auth_header_name ?? null,
      min_confidence: dto.minConfidence ?? existing?.min_confidence ?? 0.7,
      min_margin: dto.minMargin ?? existing?.min_margin ?? 0.1,
      send_notes: dto.sendNotes ?? existing?.send_notes ?? false,
      is_active: dto.isActive ?? existing?.is_active ?? true,
    });
    const credentials: Credentials =
      existing && c.auth_type === existing.auth_type
        ? this.credentials(existing)
        : {};
    for (const key of [
      'apiKey',
      'headerValue',
      'clientId',
      'clientSecret',
    ] as const)
      if (dto[key] !== undefined) credentials[key] = dto[key] || undefined;
    if (c.auth_type === 'none') {
      c.encrypted_credentials = null;
      c.credential_hint = null;
    } else {
      authHeaders(c, credentials);
      c.encrypted_credentials = this.cipher.encrypt(
        JSON.stringify(credentials),
      );
      const secret =
        c.auth_type === 'basic'
          ? credentials.clientSecret
          : c.auth_type === 'header'
            ? credentials.headerValue
            : credentials.apiKey;
      c.credential_hint =
        secret && secret.length > 4 ? secret.slice(-4) : '••••';
    }
    return c;
  }
  async test({
    userId,
    dto,
  }: {
    userId: string;
    dto?: CreateDecisionConnectionDto;
  }) {
    let c: DecisionConnection | null;
    try {
      c = dto
        ? this.merge(userId, dto)
        : await this.get({ userId, secrets: true });
    } catch (error) {
      if (error instanceof DecisionError)
        return { ok: false, status: error.code };
      throw error;
    }
    if (!c) throw new NotFoundException();
    const result = await this.probe(c);
    if (!dto)
      await this.db
        .getRepository(DecisionConnection)
        .update(
          { user_id: userId, id: c.id, revision: c.revision },
          { last_test_at: new Date(), last_test_status: result.status },
        );
    return result;
  }
  private async probe(c: DecisionConnection) {
    try {
      await this.client.scores(
        c,
        this.credentials(c),
        { description: 'Hello' },
        [{ key: 'q0', categoryId: '', label: 'Greeting' }],
        () =>
          this.limits.request({
            userId: c.user_id,
            connectionId: c.id ?? 'draft',
          }),
      );
      return { ok: true, status: 'ok' };
    } catch (error) {
      return {
        ok: false,
        status: error instanceof DecisionError ? error.code : 'unavailable',
      };
    }
  }
  async save({
    userId,
    dto,
    create,
  }: {
    userId: string;
    dto: CreateDecisionConnectionDto | UpdateDecisionConnectionDto;
    create: boolean;
  }) {
    const old = await this.get({ userId, secrets: true });
    if (create && old)
      throw new ConflictException('A connection already exists');
    if (!create && !old) throw new NotFoundException();
    let c: DecisionConnection;
    try {
      c = this.merge(userId, dto, old);
      await this.http.validate(c.base_url);
    } catch {
      throw new BadRequestException(
        'Invalid connection settings or address not allowed',
      );
    }
    if (/\/systemone\/?$/.test(c.base_url))
      throw new BadRequestException('Enter the API base URL ending in /v1');
    const result = await this.probe(c);
    c.last_test_at = new Date();
    c.last_test_status = result.status;
    if (!result.ok) c.is_active = false;
    return this.db.transaction(async (manager) => {
      const users: { id: string }[] = await manager.query(
        'SELECT id FROM users WHERE id = $1 AND deleted_at IS NULL FOR KEY SHARE',
        [userId],
      );
      if (!users.length) throw new NotFoundException();
      if (old) {
        const current = await manager.findOne(DecisionConnection, {
          where: { user_id: userId },
          lock: { mode: 'pessimistic_write' },
        });
        if (!current || current.revision !== old.revision)
          throw new ConflictException(
            'Connection changed; reload before saving',
          );
      }
      c = await manager.save(c);
      return this.toDto(c);
    });
  }
  async remove({ userId }: { userId: string }) {
    await this.db.getRepository(DecisionConnection).delete({ user_id: userId });
    // Counters expire automatically; Redis outages must not fail a committed delete.
    await this.limits.clear({ userId }).catch(() => undefined);
  }
}
