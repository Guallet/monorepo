import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/entities/notification.entity';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  DataSource,
  EntityManager,
  QueryFailedError,
  Repository,
} from 'typeorm';
import { Queue } from 'bullmq';
import { createHash, randomUUID } from 'node:crypto';
import { UserCredentialsService } from 'src/user-credentials/user-credentials.service';
import { AppConfig } from 'src/configuration';
import { ConnectedAccount } from './entities/connected-account.entity';
import { BankConnection } from './entities/bank-connection.entity';
import { BankAuthorization } from './entities/bank-authorization.entity';
import {
  connectionStatusFromProvider,
  validDate,
} from './models/bank-connection-state.model';
import { BankProviderRegistry } from './providers/bank-provider.registry';
import {
  BankProviderId,
  ProviderContext,
  ProviderCredentials,
  requireApiKey,
  requireNordigenCredentials,
} from './providers/bank-provider.interface';
import {
  AuthorizeBankDto,
  BankConnectionDto,
  BankJobResultDto,
  BankJobStatusDto,
  CreateBankConnectionDto,
} from './dto/openbanking.dto';
import {
  BankJobData,
  BankJobOperation,
  OPENBANKING_QUEUE,
} from './openbanking.jobs';

type ConnectionOwner = { userId: string; id: string };
@Injectable()
export class OpenbankingService {
  private readonly logger = new Logger(OpenbankingService.name);
  constructor(
    @InjectRepository(BankConnection)
    private readonly connections: Repository<BankConnection>,
    private readonly dataSource: DataSource,
    private readonly registry: BankProviderRegistry,
    private readonly userCredentials: UserCredentialsService,
    private readonly config: ConfigService<AppConfig>,
    @InjectQueue(OPENBANKING_QUEUE) private readonly jobs: Queue<
      BankJobData,
      BankJobResultDto
    >,
    private readonly notifications: NotificationsService,
  ) {}

  providers() {
    return this.registry.list();
  }

  async list({ userId }: { userId: string }): Promise<BankConnectionDto[]> {
    return (
      await this.connections.find({
        where: { user_id: userId },
        order: { created_at: 'ASC' },
      })
    ).map((connection) => this.toDto(connection));
  }
  async get(owner: ConnectionOwner): Promise<BankConnectionDto> {
    return this.toDto(await this.find(owner));
  }
  async create({
    userId,
    dto,
  }: {
    userId: string;
    dto: CreateBankConnectionDto;
  }): Promise<BankConnectionDto> {
    const existing = await this.connections.findOne({
      where: { user_id: userId, provider_id: dto.providerId },
    });
    if (existing)
      throw new ConflictException(
        'A connection for this provider already exists',
      );
    const credentials = this.normalizeCredentials(
      dto.providerId,
      dto.credentials,
    );
    const id = randomUUID();
    await this.registry
      .get(dto.providerId)
      .validateCredentials({ userId, connectionId: id, credentials });
    try {
      const connection = await this.connections.save(
        this.connections.create({
          id,
          user_id: userId,
          provider_id: dto.providerId,
          ...this.encrypt(dto.providerId, credentials),
          accounts: [],
          credential_version: 1,
        }),
      );
      return this.toDto(connection);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error.driverError as { code?: string }).code === '23505'
      ) {
        throw new ConflictException(
          'A connection for this provider already exists',
        );
      }
      throw error;
    }
  }
  async replaceCredentials(
    owner: ConnectionOwner & { credentials: ProviderCredentials },
  ) {
    return await this.locked(owner, async (connection, manager) => {
      const credentials = this.normalizeCredentials(
        connection.provider_id,
        owner.credentials,
      );
      await this.registry.get(connection.provider_id).validateCredentials({
        userId: owner.userId,
        connectionId: connection.id,
        credentials,
      });
      Object.assign(
        connection,
        this.encrypt(connection.provider_id, credentials),
      );
      connection.credential_version++;
      connection.accounts = [];
      connection.accounts_refreshed_at = null;
      connection.last_error = null;
      await manager.save(connection);
      return this.toDto(connection);
    });
  }
  async remove(owner: ConnectionOwner): Promise<void> {
    await this.locked(owner, async (connection, manager) => {
      await this.registry
        .get(connection.provider_id)
        .disconnect({ userId: owner.userId, connectionId: connection.id });
      await manager.delete(BankConnection, {
        id: connection.id,
        user_id: owner.userId,
      });
    });
  }
  async accounts(owner: ConnectionOwner) {
    const connection = await this.find(owner);
    return {
      accounts: connection.accounts.map((account) => ({
        id: account.id,
        name: account.name,
        institutionName: account.institutionName,
        institutionLogo: account.institutionLogo,
        currency: account.currency,
        balance: account.balance,
        status: account.status,
        linkedAccountId: account.linkedAccountId,
      })),
      refreshedAt: connection.accounts_refreshed_at,
    };
  }
  async unlink(owner: ConnectionOwner & { accountId: string }): Promise<void> {
    await this.locked(owner, async (connection, manager) => {
      await this.registry.get(connection.provider_id).unlinkAccount({
        userId: owner.userId,
        connectionId: connection.id,
        accountId: owner.accountId,
      });
      connection.accounts = connection.accounts.map((account) =>
        account.id === owner.accountId
          ? { ...account, linkedAccountId: null }
          : account,
      );
      await manager.save(connection);
    });
  }
  async enqueue(
    owner: ConnectionOwner & {
      operation: BankJobOperation;
      accountIds?: string[];
      notifyOnNewTransactions?: boolean;
    },
  ) {
    const connection = await this.find(owner);
    const accountIds = owner.accountIds
      ? [...new Set(owner.accountIds)].sort()
      : undefined;
    const selection = createHash('sha256')
      .update(JSON.stringify(accountIds ?? []))
      .digest('hex');
    const job = await this.jobs.add(
      owner.operation,
      {
        userId: owner.userId,
        connectionId: connection.id,
        credentialVersion: connection.credential_version,
        operation: owner.operation,
        accountIds,
        notifyOnNewTransactions: owner.notifyOnNewTransactions,
      },
      {
        jobId: randomUUID(),
        deduplication: {
          id: `${connection.id}_${connection.credential_version}_${owner.operation}_${selection}_${owner.notifyOnNewTransactions ? 'scheduled' : 'manual'}`,
        },
        removeOnComplete: { age: 86400, count: 1000 },
        removeOnFail: { age: 86400, count: 1000 },
        attempts: 1,
      },
    );
    return { jobId: job.id! };
  }
  async jobStatus(
    owner: ConnectionOwner & { jobId: string },
  ): Promise<BankJobStatusDto> {
    await this.find(owner);
    const job = await this.jobs.getJob(owner.jobId);
    if (
      !job ||
      job.data.userId !== owner.userId ||
      job.data.connectionId !== owner.id
    )
      throw new NotFoundException();
    const state = await job.getState();
    const status =
      state === 'completed'
        ? 'completed'
        : state === 'failed'
          ? 'failed'
          : state === 'active'
            ? 'running'
            : 'queued';
    return {
      status,
      operation: job.data.operation,
      ...(status === 'completed' ? { result: job.returnvalue } : {}),
      ...(status === 'failed'
        ? {
            error:
              'The operation failed. Check your provider connection and try again.',
          }
        : {}),
    };
  }
  async process(data: BankJobData): Promise<BankJobResultDto> {
    let newUncategorizedCount = 0;
    let providerOperationStarted = false;
    let connectionUpdatedAt: Date | undefined;
    try {
      return await this.locked(
        { userId: data.userId, id: data.connectionId },
        async (connection, manager) => {
          if (connection.credential_version !== data.credentialVersion)
            throw new BadRequestException(
              'Credentials changed; request a new operation',
            );
          const adapter = this.registry.get(connection.provider_id);
          const context = this.context(connection);
          connectionUpdatedAt = connection.updated_at;
          let result: BankJobResultDto;
          if (data.operation === 'import') {
            if (!data.accountIds?.length)
              throw new BadRequestException('Select accounts to import');
            const available = new Set(
              connection.accounts.map((account) => account.id),
            );
            if (data.accountIds.some((id) => !available.has(id)))
              throw new BadRequestException(
                'Refresh available accounts before importing',
              );
            providerOperationStarted = true;
            result = {
              accountIds: await adapter.importAccounts({
                ...context,
                accountIds: data.accountIds,
              }),
            };
          } else if (data.operation === 'sync') {
            providerOperationStarted = true;
            const syncResult = await adapter.sync(context);
            newUncategorizedCount = syncResult.newUncategorizedCount;
            result = {
              accountsSynced: syncResult.accountsSynced,
              errors: syncResult.errors,
            };
            if (!result.errors?.length) connection.last_synced_at = new Date();
          } else {
            result = {};
          }
          providerOperationStarted = true;
          const previousAccounts = new Map(
            connection.accounts.map((account) => [account.id, account]),
          );
          const discovered = await adapter.listAccounts(context);
          const refreshedAt = new Date();
          const failedIds = new Set(result.errors ?? []);
          connection.accounts = discovered.map((account) => {
            const metadata = { ...account };
            delete metadata.raw;
            const previous = previousAccounts.get(account.id);
            const status =
              account.connectionStatus ??
              connectionStatusFromProvider(account.status);
            const connectionExpiresAt =
              account.connectionExpiresAt === undefined
                ? previous?.connectionExpiresAt
                : account.connectionExpiresAt;
            const expiresAt = validDate(connectionExpiresAt);
            const expired =
              status === 'expired' ||
              (expiresAt !== null && expiresAt <= refreshedAt);
            const successful =
              status === 'connected' && !expired && !failedIds.has(account.id);
            return {
              ...metadata,
              connectionStatus: expired ? 'expired' : status,
              connectionExpiresAt,
              lastRefresh: successful
                ? refreshedAt.toISOString()
                : (previous?.lastRefresh ?? account.lastRefresh ?? null),
            };
          });
          connection.accounts_refreshed_at = refreshedAt;
          connection.last_error = failedIds.size
            ? { accountIds: [...failedIds] }
            : null;
          if (data.operation === 'refresh')
            result.accountsDiscovered = connection.accounts.length;
          for (const account of discovered) {
            if (account.raw !== undefined) {
              await manager
                .createQueryBuilder()
                .update(ConnectedAccount)
                .set({ raw: () => ':raw' })
                .where({
                  user_id: connection.user_id,
                  provider: connection.provider_id,
                  remote_account_id: account.id,
                })
                .andWhere('deleted_at IS NULL')
                .setParameter('raw', JSON.stringify(account.raw))
                .execute();
            }
          }
          await manager.save(connection);
          return result;
        },
      );
    } catch (error) {
      if (providerOperationStarted) {
        try {
          await this.connections.update(
            {
              id: data.connectionId,
              user_id: data.userId,
              credential_version: data.credentialVersion,
              updated_at: connectionUpdatedAt,
            },
            { last_error: { accountIds: null } },
          );
        } catch {
          this.logger.warn('Could not record bank connection failure');
        }
      }
      throw error;
    } finally {
      // Adapter writes have committed independently, even if discovery fails.
      if (data.notifyOnNewTransactions && newUncategorizedCount > 0) {
        try {
          await this.notifications.createSystemNotification({
            userId: data.userId,
            message: `You have ${newUncategorizedCount} new transactions to categorize`,
            icon: '👆',
            type: NotificationType.ACTION_REQUIRED,
            action: '/transactions/inbox',
          });
        } catch {
          this.logger.warn(
            'Could not send bank sync categorization notification',
          );
        }
      }
    }
  }
  async institutions(owner: ConnectionOwner & { country: string }) {
    if (!/^[A-Z]{2}$/.test(owner.country))
      throw new BadRequestException('Use a two-letter country code');
    return await this.locked(owner, async (connection) => {
      const adapter = this.registry.get(connection.provider_id);
      if (!adapter.getInstitutions)
        throw new BadRequestException(
          'This provider manages bank authorization externally',
        );
      return await adapter.getInstitutions({
        ...this.context(connection),
        country: owner.country,
      });
    });
  }
  async authorize(owner: ConnectionOwner & { dto: AuthorizeBankDto }) {
    const redirect = new URL(owner.dto.redirectUrl);
    const origins =
      this.config.get('auth.allowedOrigins', { infer: true }) ?? [];
    if (
      redirect.username ||
      redirect.password ||
      !origins.some((origin) => origin.trim() === redirect.origin)
    )
      throw new BadRequestException('Callback origin is not allowed');
    return await this.locked(owner, async (connection, manager) => {
      const adapter = this.registry.get(connection.provider_id);
      if (!adapter.authorize)
        throw new BadRequestException(
          'This provider manages bank authorization externally',
        );
      const id = randomUUID();
      redirect.searchParams.set('connectionId', connection.id);
      redirect.searchParams.set('authorizationId', id);
      const result = await adapter.authorize({
        ...this.context(connection),
        institutionId: owner.dto.institutionId,
        redirectUrl: redirect.toString(),
        reference: id,
      });
      await manager.save(BankAuthorization, {
        id,
        user_id: owner.userId,
        connection_id: connection.id,
        remote_id: result.remoteId,
        account_ids: [],
        expires_at: new Date(Date.now() + 60 * 60 * 1000),
      });
      return {
        id,
        action: 'redirect' as const,
        redirectUrl: result.redirectUrl,
      };
    });
  }
  async completeAuthorization(
    owner: ConnectionOwner & { authorizationId: string },
  ) {
    await this.locked(owner, async (connection, manager) => {
      const authorization = await manager.findOne(BankAuthorization, {
        where: {
          id: owner.authorizationId,
          connection_id: owner.id,
          user_id: owner.userId,
        },
      });
      if (!authorization) throw new NotFoundException();
      if (authorization.completed_at) return;
      if (authorization.expires_at.getTime() < Date.now())
        throw new BadRequestException('Authorization expired; start again');
      const adapter = this.registry.get(connection.provider_id);
      if (!adapter.completeAuthorization)
        throw new BadRequestException('Authorization is not supported');
      authorization.account_ids = await adapter.completeAuthorization({
        ...this.context(connection),
        remoteId: authorization.remote_id,
      });
      authorization.completed_at = new Date();
      await manager.save(authorization);
    });
    return await this.enqueue({ ...owner, operation: 'refresh' });
  }
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async syncAll(): Promise<void> {
    // System scheduler explicitly enumerates owners; every enqueued operation rechecks ownership.
    const connections = await this.connections.find({
      select: { id: true, user_id: true },
    });
    for (const connection of connections) {
      try {
        await this.enqueue({
          id: connection.id,
          userId: connection.user_id,
          operation: 'sync',
          notifyOnNewTransactions: true,
        });
      } catch {
        this.logger.warn('Could not schedule a bank connection sync');
      }
    }
  }
  private async find({ id, userId }: ConnectionOwner) {
    const connection = await this.connections.findOne({
      where: { id, user_id: userId },
    });
    if (!connection) throw new NotFoundException();
    return connection;
  }
  private async locked<T>(
    { id, userId }: ConnectionOwner,
    operation: (
      connection: BankConnection,
      manager: EntityManager,
    ) => Promise<T>,
  ): Promise<T> {
    // Serializes jobs, credential changes and disconnects across API/worker replicas.
    return await this.dataSource.transaction(async (manager) => {
      const connection = await manager
        .getRepository(BankConnection)
        .createQueryBuilder('connection')
        .addSelect('connection.encrypted_credentials')
        .where('connection.id = :id AND connection.user_id = :userId', {
          id,
          userId,
        })
        .setLock('pessimistic_write')
        .getOne();
      if (!connection) throw new NotFoundException();
      return await operation(connection, manager);
    });
  }
  private normalizeCredentials(
    providerId: BankProviderId,
    credentials: ProviderCredentials,
  ) {
    return providerId === 'nordigen'
      ? requireNordigenCredentials(credentials)
      : { apiKey: requireApiKey(credentials) };
  }
  private encrypt(
    providerId: BankProviderId,
    credentials: ProviderCredentials,
  ) {
    const secret =
      providerId === 'nordigen' ? credentials.secretKey! : credentials.apiKey!;
    return {
      encrypted_credentials: this.userCredentials.encrypt(
        providerId === 'nordigen' ? JSON.stringify(credentials) : secret,
      ),
      credential_hint: secret.length > 4 ? secret.slice(-4) : '••••',
    };
  }
  private context(connection: BankConnection): ProviderContext {
    const plaintext = this.userCredentials.decrypt(
      connection.encrypted_credentials,
    );
    const credentials =
      connection.provider_id === 'nordigen'
        ? this.normalizeCredentials(
            connection.provider_id,
            JSON.parse(plaintext) as ProviderCredentials,
          )
        : { apiKey: plaintext };
    return {
      userId: connection.user_id,
      connectionId: connection.id,
      credentials,
    };
  }
  private toDto(connection: BankConnection): BankConnectionDto {
    return {
      id: connection.id,
      providerId: connection.provider_id,
      status: 'configured',
      credentialHint: connection.credential_hint?.replace(/^•+/, '') ?? null,
      accountsRefreshedAt: connection.accounts_refreshed_at ?? null,
      lastSyncedAt: connection.last_synced_at ?? null,
    };
  }
}
