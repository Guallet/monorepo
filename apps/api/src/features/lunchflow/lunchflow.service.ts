import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Money } from '@guallet/money';
import { AiCredentialEncryptionService } from 'src/features/ai/ai-credential-encryption.service';
import { Account } from 'src/features/accounts/entities/account.entity';
import { AccountSource } from 'src/features/accounts/entities/accountSource.model';
import { AccountType } from 'src/features/accounts/entities/accountType.model';
import { Transaction } from 'src/features/transactions/entities/transaction.entity';
import { Repository } from 'typeorm';
import { LunchFlowAccount } from './entities/lunchflow-account.entity';
import { LunchFlowCredential } from './entities/lunchflow-credential.entity';
import { LunchFlowClient, LunchFlowRemoteAccount } from './lunchflow.client';
import { LunchFlowCredentialDto } from './dto/lunchflow.dto';

@Injectable()
export class LunchFlowService {
  private readonly logger = new Logger(LunchFlowService.name);

  constructor(
    @InjectRepository(LunchFlowCredential)
    private readonly credentials: Repository<LunchFlowCredential>,
    @InjectRepository(LunchFlowAccount)
    private readonly remoteAccounts: Repository<LunchFlowAccount>,
    @InjectRepository(Account)
    private readonly accounts: Repository<Account>,
    @InjectRepository(Transaction)
    private readonly transactions: Repository<Transaction>,
    private readonly client: LunchFlowClient,
    private readonly cipher: AiCredentialEncryptionService,
  ) {}

  async getCredential(userId: string): Promise<LunchFlowCredentialDto> {
    return LunchFlowCredentialDto.fromDomain(
      await this.credentials.findOne({ where: { user_id: userId } }),
    );
  }

  async saveCredential({
    userId,
    apiKey,
  }: {
    userId: string;
    apiKey: string;
  }): Promise<LunchFlowCredentialDto> {
    try {
      await this.client.getAccounts(apiKey);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw new BadRequestException('Lunch Flow API key is invalid');
      }
      throw error;
    }

    const existing = await this.credentials
      .createQueryBuilder('credential')
      .addSelect('credential.encrypted_api_key')
      .where('credential.user_id = :userId', { userId })
      .getOne();
    const credential = existing ?? this.credentials.create({ user_id: userId });
    credential.encrypted_api_key = this.cipher.encrypt(apiKey);
    credential.api_key_hint = apiKey.length > 4 ? apiKey.slice(-4) : '••••';
    return LunchFlowCredentialDto.fromDomain(
      await this.credentials.save(credential),
    );
  }

  async deleteCredential(userId: string): Promise<void> {
    await this.remoteAccounts.delete({ user_id: userId });
    await this.credentials.delete({ user_id: userId });
  }

  async listRemoteAccounts(userId: string) {
    const apiKey = await this.getApiKey(userId);
    const [accounts, linked] = await Promise.all([
      this.client.getAccounts(apiKey),
      this.remoteAccounts.find({ where: { user_id: userId } }),
    ]);
    const linkedByRemoteId = new Map(
      linked.map((item) => [item.remote_account_id, item.guallet_account_id]),
    );
    return accounts.map((account) => ({
      id: String(account.id),
      name: account.name,
      institutionName: account.institution_name ?? null,
      institutionLogo: account.institution_logo ?? null,
      provider: account.provider ?? null,
      currency: account.currency ?? null,
      status: account.status ?? 'ACTIVE',
      linkedAccountId: linkedByRemoteId.get(String(account.id)) ?? null,
    }));
  }

  async importAccounts({
    userId,
    accountIds,
  }: {
    userId: string;
    accountIds: string[];
  }): Promise<string[]> {
    const apiKey = await this.getApiKey(userId);
    const remote = await this.client.getAccounts(apiKey);
    const requested = new Set(accountIds);
    const selected = remote.filter((account) =>
      requested.has(String(account.id)),
    );
    if (selected.length !== requested.size) {
      throw new BadRequestException(
        'One or more Lunch Flow accounts are unavailable',
      );
    }

    const mappings = await Promise.all(
      selected.map((account) =>
        this.importRemoteAccount({ userId, apiKey, account }),
      ),
    );
    return mappings.map((mapping) => mapping.guallet_account_id);
  }

  async syncUserAccounts(userId: string) {
    const apiKey = await this.getApiKey(userId);
    const mappings = await this.remoteAccounts.find({
      where: { user_id: userId },
    });
    return await this.syncMappings(userId, apiKey, mappings);
  }

  async unlinkAccount({
    userId,
    remoteAccountId,
  }: {
    userId: string;
    remoteAccountId: string;
  }): Promise<void> {
    const result = await this.remoteAccounts.delete({
      user_id: userId,
      remote_account_id: remoteAccountId,
    });
    if (!result.affected) throw new NotFoundException();
  }

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async syncAllAccounts(): Promise<void> {
    const mappings = await this.remoteAccounts.find();
    const byUser = new Map<string, LunchFlowAccount[]>();
    for (const mapping of mappings) {
      const items = byUser.get(mapping.user_id) ?? [];
      items.push(mapping);
      byUser.set(mapping.user_id, items);
    }
    await Promise.all(
      [...byUser].map(async ([userId, userMappings]) => {
        try {
          const key = await this.getApiKey(userId);
          await this.syncMappings(userId, key, userMappings);
        } catch {
          this.logger.warn(`Lunch Flow sync failed for user ${userId}`);
        }
      }),
    );
  }

  private async importRemoteAccount({
    userId,
    apiKey,
    account,
  }: {
    userId: string;
    apiKey: string;
    account: LunchFlowRemoteAccount;
  }) {
    const remoteId = String(account.id);
    let mapping = await this.remoteAccounts.findOne({
      where: { user_id: userId, remote_account_id: remoteId },
    });
    const balance = await this.client.getBalance(apiKey, remoteId);
    const transactions = await this.client.getTransactions(apiKey, remoteId);

    let localAccount: Account | null = null;
    if (mapping) {
      localAccount = await this.accounts.findOne({
        where: { id: mapping.guallet_account_id, user_id: userId },
      });
      if (!localAccount) {
        throw new NotFoundException('Linked Guallet account not found');
      }
    } else {
      localAccount = await this.accounts.save({
        user_id: userId,
        name: account.name,
        balance: Money.fromCurrencyCode({
          amount: balance.amount,
          currencyCode: balance.currency,
        }).amount,
        currency: balance.currency || account.currency || 'GBP',
        type: AccountType.UNKNOWN,
        source: AccountSource.SYNCED,
        source_name: 'Lunch Flow',
        institutionId: null,
        properties: null,
      });
      mapping = await this.remoteAccounts.save({
        user_id: userId,
        remote_account_id: remoteId,
        remote_connection_id:
          account.connection_id === undefined || account.connection_id === null
            ? null
            : String(account.connection_id),
        guallet_account_id: localAccount.id,
      });
    }
    await this.persistRemoteData({
      apiKey,
      account,
      mapping,
      localAccount,
      transactions,
      balance,
    });
    return mapping;
  }

  private async syncMappings(
    userId: string,
    apiKey: string,
    mappings: LunchFlowAccount[],
  ) {
    const remote = await this.client.getAccounts(apiKey);
    const remoteById = new Map(
      remote.map((account) => [String(account.id), account]),
    );
    const errors: string[] = [];
    let accountsSynced = 0;
    const results = await Promise.all(
      mappings.map(async (mapping) => {
        const account = remoteById.get(mapping.remote_account_id);
        if (!account) return null;
        try {
          const localAccount = await this.accounts.findOne({
            where: { id: mapping.guallet_account_id, user_id: userId },
          });
          if (!localAccount) return null;
          const [balance, transactions] = await Promise.all([
            this.client.getBalance(apiKey, mapping.remote_account_id),
            this.client.getTransactions(apiKey, mapping.remote_account_id),
          ]);
          await this.persistRemoteData({
            apiKey,
            account,
            mapping,
            localAccount,
            transactions,
            balance,
          });
          return true;
        } catch {
          return mapping.remote_account_id;
        }
      }),
    );
    for (const remoteAccountId of results) {
      if (typeof remoteAccountId === 'string') {
        errors.push(remoteAccountId);
        this.logger.warn(
          `Lunch Flow account sync failed for ${remoteAccountId}`,
        );
      } else if (remoteAccountId) {
        accountsSynced += 1;
      }
    }
    return { accountsSynced, errors };
  }

  private async persistRemoteData({
    apiKey,
    account,
    mapping,
    localAccount,
    transactions,
    balance,
  }: {
    apiKey: string;
    account: LunchFlowRemoteAccount;
    mapping: LunchFlowAccount;
    localAccount: Account;
    transactions: Awaited<ReturnType<LunchFlowClient['getTransactions']>>;
    balance?: { amount: number; currency: string };
  }) {
    const currentBalance =
      balance ??
      (await this.client.getBalance(apiKey, mapping.remote_account_id));
    localAccount.balance = Money.fromCurrencyCode({
      amount: currentBalance.amount,
      currencyCode: currentBalance.currency,
    }).amount;
    localAccount.currency =
      currentBalance.currency || account.currency || localAccount.currency;
    localAccount.name = account.name;
    await this.accounts.save(localAccount);

    const rows = transactions.map((transaction) => {
      const money = Money.fromCurrencyCode({
        amount: Number(transaction.amount),
        currencyCode: transaction.currency || localAccount.currency,
      });
      return {
        accountId: localAccount.id,
        externalId: `lunchflow:${localAccount.id}:${transaction.id}`,
        amount: money.amount,
        currency: money.currency.code,
        date: new Date(transaction.date),
        description: transaction.merchant || transaction.description || '',
        metadata: {
          provider: 'lunchflow' as const,
          data: transaction,
        },
      };
    });
    if (rows.length) {
      await this.transactions.upsert(rows, {
        conflictPaths: ['externalId'],
        skipUpdateIfNoValuesChanged: true,
      });
    }
  }

  private async getApiKey(userId: string): Promise<string> {
    const credential = await this.credentials
      .createQueryBuilder('credential')
      .addSelect('credential.encrypted_api_key')
      .where('credential.user_id = :userId', { userId })
      .getOne();
    if (!credential)
      throw new NotFoundException('Lunch Flow key is not configured');
    try {
      return this.cipher.decrypt(credential.encrypted_api_key);
    } catch {
      throw new BadGatewayException('Lunch Flow key could not be decrypted');
    }
  }
}
