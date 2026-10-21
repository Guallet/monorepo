import {
  BankProviderAdapter,
  ProviderContext,
  ProviderIdentity,
  requireApiKey,
} from '../openbanking/providers/bank-provider.interface';
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Money } from '@guallet/money';
import { Account } from 'src/features/accounts/entities/account.entity';
import { AccountSource } from 'src/features/accounts/entities/accountSource.model';
import { AccountType } from 'src/features/accounts/entities/accountType.model';
import { Transaction } from 'src/features/transactions/entities/transaction.entity';
import { persistPersonalProviderTransactions } from 'src/features/transactions/personal-provider-transactions';
import { Repository } from 'typeorm';
import { SynciAccount } from './entities/synci-account.entity';
import { SynciClient, SynciRemoteAccount } from './synci.client';

@Injectable()
export class SynciService implements BankProviderAdapter {
  private readonly logger = new Logger(SynciService.name);

  constructor(
    @InjectRepository(SynciAccount)
    private readonly remoteAccounts: Repository<SynciAccount>,
    @InjectRepository(Account)
    private readonly accounts: Repository<Account>,
    @InjectRepository(Transaction)
    private readonly transactions: Repository<Transaction>,
    private readonly client: SynciClient,
  ) {}

  async validateCredentials({
    userId,
    credentials,
  }: ProviderContext): Promise<void> {
    const apiKey = requireApiKey(credentials);
    await this.client.getAccounts(apiKey);
  }

  async disconnect({ userId }: ProviderIdentity): Promise<void> {
    await this.remoteAccounts.update({ user_id: userId }, { is_linked: false });
  }

  async listAccounts({ userId, credentials }: ProviderContext) {
    const apiKey = requireApiKey(credentials);
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
    credentials,
    accountIds,
  }: ProviderContext & { accountIds: string[] }): Promise<string[]> {
    const apiKey = requireApiKey(credentials);
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

    // Finish every write before releasing the connection lock, even on failure.
    const imported: string[] = [];
    for (const account of selected) {
      const mapping = await this.importRemoteAccount({
        userId,
        apiKey,
        account,
      });
      imported.push(mapping.guallet_account_id);
    }
    return imported;
  }

  async sync({ userId, credentials }: ProviderContext) {
    const apiKey = requireApiKey(credentials);
    const mappings = await this.remoteAccounts.find({
      where: { user_id: userId, is_linked: true },
    });
    return await this.syncMappings(userId, apiKey, mappings);
  }

  async unlinkAccount({
    userId,
    accountId: remoteAccountId,
  }: ProviderIdentity & { accountId: string }): Promise<void> {
    const result = await this.remoteAccounts.update(
      {
        user_id: userId,
        remote_account_id: remoteAccountId,
      },
      { is_linked: false },
    );
    if (!result.affected) throw new NotFoundException();
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
      const created = await this.accounts.manager.transaction(
        async (manager) => {
          const createdAccount = await manager.save(Account, {
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
          const createdMapping = await manager.save(SynciAccount, {
            user_id: userId,
            remote_account_id: remoteId,
            remote_connection_id:
              account.connection_id === undefined ||
              account.connection_id === null
                ? null
                : String(account.connection_id),
            guallet_account_id: createdAccount.id,
            is_linked: true,
          });
          return { account: createdAccount, mapping: createdMapping };
        },
      );
      localAccount = created.account;
      mapping = created.mapping;
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
}
