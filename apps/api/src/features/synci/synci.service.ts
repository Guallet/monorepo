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
import { persistPersonalProviderTransactions } from 'src/features/transactions/personal-provider-transactions';
import { Repository } from 'typeorm';
import { SynciAccount } from './entities/synci-account.entity';
import { SynciCredential } from './entities/synci-credential.entity';
import { SynciClient, SynciRemoteAccount } from './synci.client';
import { SynciCredentialDto } from './dto/synci.dto';

@Injectable()
export class SynciService {
  private readonly logger = new Logger(SynciService.name);

  constructor(
    @InjectRepository(SynciCredential)
    private readonly credentials: Repository<SynciCredential>,
    @InjectRepository(SynciAccount)
    private readonly remoteAccounts: Repository<SynciAccount>,
    @InjectRepository(Account)
    private readonly accounts: Repository<Account>,
    @InjectRepository(Transaction)
    private readonly transactions: Repository<Transaction>,
    private readonly client: SynciClient,
    private readonly cipher: AiCredentialEncryptionService,
  ) {}

  async getCredential(userId: string): Promise<SynciCredentialDto> {
    return SynciCredentialDto.fromDomain(
      await this.credentials.findOne({ where: { user_id: userId } }),
    );
  }

  async saveCredential({
    userId,
    apiKey,
  }: {
    userId: string;
    apiKey: string;
  }): Promise<SynciCredentialDto> {
    try {
      await this.client.getAccounts(apiKey);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw new BadRequestException('Synci API key is invalid');
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
    return SynciCredentialDto.fromDomain(
      await this.credentials.save(credential),
    );
  }

  async deleteCredential(userId: string): Promise<void> {
    await this.credentials.delete({ user_id: userId });
  }

  async listRemoteAccounts(userId: string) {
    const apiKey = await this.getApiKey(userId);
    const [accounts, linked] = await Promise.all([
      this.client.getAccounts(apiKey),
      this.remoteAccounts.find({ where: { user_id: userId } }),
    ]);
    const linkedByRemoteId = new Map(
      linked
        .filter((item) => item.is_linked)
        .map((item) => [item.remote_account_id, item.guallet_account_id]),
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
        'One or more Synci accounts are unavailable',
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
      where: { user_id: userId, is_linked: true },
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
    const result = await this.remoteAccounts.update(
      {
        user_id: userId,
        remote_account_id: remoteAccountId,
      },
      { is_linked: false },
    );
    if (!result.affected) throw new NotFoundException();
  }

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async syncAllAccounts(): Promise<void> {
    const mappings = await this.remoteAccounts.find({
      where: { is_linked: true },
    });
    const byUser = new Map<string, SynciAccount[]>();
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
        } catch (error) {
          if (!(error instanceof NotFoundException)) {
            this.logger.warn(`Synci sync failed for user ${userId}`);
          }
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
    account: SynciRemoteAccount;
  }) {
    const remoteId = String(account.id);
    let mapping = await this.remoteAccounts.findOne({
      where: { user_id: userId, remote_account_id: remoteId },
    });
    const balance = this.client.getBalance(account);
    const transactions = await this.client.getTransactions(apiKey, remoteId);

    let localAccount: Account | null = null;
    if (mapping) {
      localAccount = await this.accounts.findOne({
        where: { id: mapping.guallet_account_id, user_id: userId },
      });
      if (!localAccount) {
        throw new NotFoundException('Linked Guallet account not found');
      }
      localAccount.source = AccountSource.IMPORTED;
      localAccount.source_name = 'Synci';
      if (!mapping.is_linked) {
        mapping.is_linked = true;
        await this.remoteAccounts.save(mapping);
      }
    } else {
      const currency = balance.currency || account.currency || 'GBP';
      localAccount = await this.accounts.save({
        user_id: userId,
        name: account.name,
        balance: Money.fromCurrencyCode({
          amount: balance.amount,
          currencyCode: currency,
        }).amount,
        currency,
        type: AccountType.UNKNOWN,
        source: AccountSource.IMPORTED,
        source_name: 'Synci',
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
        is_linked: true,
      });
    }
    await this.persistRemoteData({
      account,
      mapping,
      localAccount,
      transactions,
      balance,
    });
    mapping.last_synced_at = new Date();
    await this.remoteAccounts.save(mapping);
    return mapping;
  }

  private async syncMappings(
    userId: string,
    apiKey: string,
    mappings: SynciAccount[],
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
        if (!account) return mapping.remote_account_id;
        try {
          const localAccount = await this.accounts.findOne({
            where: { id: mapping.guallet_account_id, user_id: userId },
          });
          if (!localAccount) return mapping.remote_account_id;
          const to = new Date().toISOString().slice(0, 10);
          const fromDate = mapping.last_synced_at
            ? new Date(mapping.last_synced_at)
            : null;
          if (fromDate) fromDate.setUTCDate(fromDate.getUTCDate() - 7);
          const transactions = await this.client.getTransactions(
            apiKey,
            mapping.remote_account_id,
            fromDate?.toISOString().slice(0, 10),
            to,
          );
          await this.persistRemoteData({
            account,
            mapping,
            localAccount,
            transactions,
            balance: this.client.getBalance(account),
          });
          mapping.last_synced_at = new Date();
          await this.remoteAccounts.save(mapping);
          return true;
        } catch {
          return mapping.remote_account_id;
        }
      }),
    );
    for (const remoteAccountId of results) {
      if (typeof remoteAccountId === 'string') {
        errors.push(remoteAccountId);
        this.logger.warn(`Synci account sync failed for ${remoteAccountId}`);
      } else if (remoteAccountId) {
        accountsSynced += 1;
      }
    }
    return { accountsSynced, errors };
  }

  private async persistRemoteData({
    account,
    mapping,
    localAccount,
    transactions,
    balance,
  }: {
    account: SynciRemoteAccount;
    mapping: SynciAccount;
    localAccount: Account;
    transactions: Awaited<ReturnType<SynciClient['getTransactions']>>;
    balance?: { amount: number; currency: string };
  }) {
    const currentBalance = balance ?? this.client.getBalance(account);
    const currency =
      currentBalance.currency || account.currency || localAccount.currency;
    localAccount.balance = Money.fromCurrencyCode({
      amount: currentBalance.amount,
      currencyCode: currency,
    }).amount;
    localAccount.currency = currency;
    localAccount.name = account.name;
    await this.accounts.save(localAccount);

    await persistPersonalProviderTransactions({
      repository: this.transactions,
      accountId: localAccount.id,
      provider: 'synci',
      userId: mapping.user_id,
      remoteAccountId: mapping.remote_account_id,
      currency: localAccount.currency,
      transactions,
    });
  }

  private async getApiKey(userId: string): Promise<string> {
    const credential = await this.credentials
      .createQueryBuilder('credential')
      .addSelect('credential.encrypted_api_key')
      .where('credential.user_id = :userId', { userId })
      .getOne();
    if (!credential) throw new NotFoundException('Synci key is not configured');
    try {
      return this.cipher.decrypt(credential.encrypted_api_key);
    } catch {
      throw new BadGatewayException('Synci key could not be decrypted');
    }
  }
}
