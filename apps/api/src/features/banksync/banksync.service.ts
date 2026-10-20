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
import { In, Repository } from 'typeorm';
import {
  BankSyncBank,
  BankSyncClient,
  BankSyncRemoteAccount,
  BankSyncRemoteTransaction,
} from './banksync.client';
import { BankSyncAccount } from './entities/banksync-account.entity';
import { BankSyncCredential } from './entities/banksync-credential.entity';
import { BankSyncCredentialDto } from './dto/banksync.dto';

const HISTORY_YEARS = 7;
const SYNC_OVERLAP_DAYS = 7;

@Injectable()
export class BankSyncService {
  private readonly logger = new Logger(BankSyncService.name);

  constructor(
    @InjectRepository(BankSyncCredential)
    private readonly credentials: Repository<BankSyncCredential>,
    @InjectRepository(BankSyncAccount)
    private readonly remoteAccounts: Repository<BankSyncAccount>,
    @InjectRepository(Account)
    private readonly accounts: Repository<Account>,
    @InjectRepository(Transaction)
    private readonly transactions: Repository<Transaction>,
    private readonly client: BankSyncClient,
    private readonly cipher: AiCredentialEncryptionService,
  ) {}

  async getCredential(userId: string): Promise<BankSyncCredentialDto> {
    return BankSyncCredentialDto.fromDomain(
      await this.credentials.findOne({ where: { user_id: userId } }),
    );
  }

  async saveCredential({
    userId,
    apiKey,
  }: {
    userId: string;
    apiKey: string;
  }): Promise<BankSyncCredentialDto> {
    try {
      await this.client.getBanks(apiKey, userId);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw new BadRequestException('BankSync API key is invalid');
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
    return BankSyncCredentialDto.fromDomain(
      await this.credentials.save(credential),
    );
  }

  async deleteCredential(userId: string): Promise<void> {
    await this.credentials.delete({ user_id: userId });
  }

  async listRemoteAccounts(userId: string) {
    const apiKey = await this.getApiKey(userId);
    const banks = await this.client.getBanks(apiKey, userId);
    const mappings = await this.remoteAccounts.find({
      where: { user_id: userId },
    });
    const linkedByRemoteKey = new Map(
      mappings
        .filter((mapping) => mapping.is_linked)
        .map((mapping) => [
          this.remoteKey(mapping.remote_bank_id, mapping.remote_account_id),
          mapping.guallet_account_id,
        ]),
    );
    const remoteAccountsByBank = await Promise.all(
      banks.map(async (bank) => {
        if (bank.connectionStatus?.connected === false) {
          return { bank, accounts: [] as BankSyncRemoteAccount[] };
        }
        try {
          return {
            bank,
            accounts: await this.client.getAccounts(apiKey, bank.id, userId),
          };
        } catch {
          this.logger.warn(
            `BankSync account discovery failed for bank ${bank.id}`,
          );
          return { bank, accounts: [] as BankSyncRemoteAccount[] };
        }
      }),
    );
    return remoteAccountsByBank.flatMap(({ bank, accounts }) =>
      accounts.flatMap((account) => {
        const id = this.remoteAccountId(account);
        if (!id) return [];
        return [
          {
            id: JSON.stringify([bank.id, id]),
            name: account.name ?? account.accountName ?? 'Bank account',
            institutionName: bank.name,
            currency: account.currency ?? null,
            balance: this.remoteBalance(account)?.amount.toString() ?? null,
            linkedAccountId:
              linkedByRemoteKey.get(this.remoteKey(bank.id, id)) ?? null,
          },
        ];
      }),
    );
  }

  async importAccounts({
    userId,
    selections,
  }: {
    userId: string;
    selections: Array<{ bankId: string; accountId: string }>;
  }): Promise<string[]> {
    const apiKey = await this.getApiKey(userId);
    const selected = new Map<
      string,
      {
        bank: BankSyncBank;
        account: BankSyncRemoteAccount;
      }
    >();
    const banks = await this.client.getBanks(apiKey, userId);
    const banksById = new Map(banks.map((bank) => [bank.id, bank]));
    const selectedBankIds = [
      ...new Set(selections.map((selection) => selection.bankId)),
    ].filter((bankId) => {
      const bank = banksById.get(bankId);
      return bank && bank.connectionStatus?.connected !== false;
    });
    const accountGroups = await Promise.all(
      selectedBankIds.map(
        async (bankId) =>
          [
            bankId,
            await this.client.getAccounts(apiKey, bankId, userId),
          ] as const,
      ),
    );
    const accountsByBank = new Map(accountGroups);
    for (const selection of selections) {
      const bank = banksById.get(selection.bankId);
      if (!bank || bank.connectionStatus?.connected === false) continue;
      const remoteAccounts = accountsByBank.get(selection.bankId) ?? [];
      const account = remoteAccounts.find(
        (item) => this.remoteAccountId(item) === selection.accountId,
      );
      if (account) {
        selected.set(this.remoteKey(bank.id, this.remoteAccountId(account)!), {
          bank,
          account,
        });
      }
    }
    const requestedKeys = new Set(
      selections.map((item) => this.remoteKey(item.bankId, item.accountId)),
    );
    if (selected.size !== requestedKeys.size) {
      throw new BadRequestException(
        'One or more BankSync accounts are unavailable',
      );
    }

    const mappings = await Promise.all(
      [...selected.values()].map(({ bank, account }) =>
        this.importRemoteAccount({ userId, apiKey, bank, account }),
      ),
    );
    return mappings.map((mapping) => mapping.guallet_account_id);
  }

  async syncUserAccounts(userId: string) {
    const apiKey = await this.getApiKey(userId);
    const mappings = await this.remoteAccounts.find({
      where: { user_id: userId, is_linked: true },
    });
    if (mappings.length === 0) return { accountsSynced: 0, errors: [] };
    return await this.syncMappings(userId, apiKey, mappings);
  }

  async unlinkAccount({
    userId,
    bankId,
    accountId,
  }: {
    userId: string;
    bankId: string;
    accountId: string;
  }): Promise<void> {
    const result = await this.remoteAccounts.update(
      {
        user_id: userId,
        remote_bank_id: bankId,
        remote_account_id: accountId,
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
    const byUser = new Map<string, BankSyncAccount[]>();
    for (const mapping of mappings) {
      const items = byUser.get(mapping.user_id) ?? [];
      items.push(mapping);
      byUser.set(mapping.user_id, items);
    }
    await Promise.all(
      [...byUser].map(async ([userId, userMappings]) => {
        try {
          const apiKey = await this.getApiKey(userId);
          await this.syncMappings(userId, apiKey, userMappings);
        } catch (error) {
          if (!(error instanceof NotFoundException)) {
            this.logger.warn(`BankSync sync failed for user ${userId}`);
          }
        }
      }),
    );
  }

  private async importRemoteAccount({
    userId,
    apiKey,
    bank,
    account,
  }: {
    userId: string;
    apiKey: string;
    bank: BankSyncBank;
    account: BankSyncRemoteAccount;
  }) {
    const remoteId = this.remoteAccountId(account);
    if (!remoteId) throw new BadGatewayException('BankSync account has no ID');
    let mapping = await this.remoteAccounts.findOne({
      where: {
        user_id: userId,
        remote_bank_id: bank.id,
        remote_account_id: remoteId,
      },
    });
    const transactionResult = await this.getTransactionsForMapping(
      userId,
      apiKey,
      bank.id,
      remoteId,
      null,
    );
    const reportedBalance =
      this.remoteBalance(account) ??
      (await this.client.getBalances(apiKey, bank.id, remoteId, userId));
    let localAccount: Account | null = null;
    let createdLocalAccount = false;
    if (mapping) {
      localAccount = await this.accounts.findOne({
        where: { id: mapping.guallet_account_id, user_id: userId },
      });
      if (!localAccount)
        throw new NotFoundException('Linked Guallet account not found');
      localAccount.source = AccountSource.IMPORTED;
      localAccount.source_name = 'BankSync';
      if (!mapping.is_linked) mapping.is_linked = true;
    } else {
      const currency = account.currency ?? reportedBalance?.currency ?? 'USD';
      const balance =
        reportedBalance?.currency === currency ? reportedBalance.amount : 0;
      localAccount = await this.accounts.save({
        user_id: userId,
        name: account.name ?? account.accountName ?? bank.name,
        balance: Money.fromCurrencyCode({
          amount: balance,
          currencyCode: currency,
        }).amount,
        currency,
        type: AccountType.UNKNOWN,
        source: AccountSource.IMPORTED,
        source_name: 'BankSync',
        institutionId: null,
        properties: null,
      });
      createdLocalAccount = true;
      mapping = this.remoteAccounts.create({
        user_id: userId,
        remote_bank_id: bank.id,
        remote_account_id: remoteId,
        guallet_account_id: localAccount.id,
        is_linked: true,
      });
    }
    try {
      await this.remoteAccounts.save(mapping);
    } catch (error) {
      if (!createdLocalAccount || !this.isUniqueConstraintError(error)) {
        throw error;
      }
      await this.accounts.delete({ id: localAccount.id, user_id: userId });
      mapping = await this.remoteAccounts.findOneByOrFail({
        user_id: userId,
        remote_bank_id: bank.id,
        remote_account_id: remoteId,
      });
      localAccount = await this.accounts.findOneOrFail({
        where: { id: mapping.guallet_account_id, user_id: userId },
      });
      localAccount.source = AccountSource.IMPORTED;
      localAccount.source_name = 'BankSync';
      mapping.is_linked = true;
    }
    await this.persistRemoteData({
      bank,
      account,
      mapping,
      localAccount,
      transactions: transactionResult.transactions,
      removedTransactionIds: transactionResult.removedIds,
      balance: reportedBalance,
    });
    mapping.last_synced_at = new Date();
    await this.remoteAccounts.save(mapping);
    return mapping;
  }

  private async syncMappings(
    userId: string,
    apiKey: string,
    mappings: BankSyncAccount[],
  ) {
    const banks = await this.client.getBanks(apiKey, userId);
    const remoteAccounts = new Map<
      string,
      {
        bank: BankSyncBank;
        account: BankSyncRemoteAccount;
      }
    >();
    const failedBanks = new Set<string>();
    const accountGroups = await Promise.all(
      banks.map(async (bank) => {
        if (bank.connectionStatus?.connected === false) {
          failedBanks.add(bank.id);
          return { bank, accounts: [] as BankSyncRemoteAccount[] };
        }
        try {
          return {
            bank,
            accounts: await this.client.getAccounts(apiKey, bank.id, userId),
          };
        } catch {
          failedBanks.add(bank.id);
          this.logger.warn(
            `BankSync account discovery failed for bank ${bank.id}`,
          );
          return { bank, accounts: [] as BankSyncRemoteAccount[] };
        }
      }),
    );
    for (const { bank, accounts } of accountGroups) {
      for (const account of accounts) {
        const accountId = this.remoteAccountId(account);
        if (!accountId) continue;
        remoteAccounts.set(this.remoteKey(bank.id, accountId), {
          bank,
          account,
        });
      }
    }
    const errors: string[] = [];
    let accountsSynced = 0;
    const results = await Promise.all(
      mappings.map(async (mapping) => {
        const key = this.remoteKey(
          mapping.remote_bank_id,
          mapping.remote_account_id,
        );
        if (failedBanks.has(mapping.remote_bank_id)) {
          return mapping.remote_account_id;
        }
        const remote = remoteAccounts.get(key);
        if (!remote) {
          return mapping.remote_account_id;
        }
        try {
          const localAccount = await this.accounts.findOne({
            where: { id: mapping.guallet_account_id, user_id: userId },
          });
          if (!localAccount) {
            return mapping.remote_account_id;
          }
          const [transactionResult, reportedBalance] = await Promise.all([
            this.getTransactionsForMapping(
              userId,
              apiKey,
              mapping.remote_bank_id,
              mapping.remote_account_id,
              mapping.last_synced_at,
            ),
            this.remoteBalance(remote.account)
              ? Promise.resolve(this.remoteBalance(remote.account))
              : this.client.getBalances(
                  apiKey,
                  mapping.remote_bank_id,
                  mapping.remote_account_id,
                  userId,
                ),
          ]);
          await this.persistRemoteData({
            bank: remote.bank,
            account: remote.account,
            mapping,
            localAccount,
            transactions: transactionResult.transactions,
            removedTransactionIds: transactionResult.removedIds,
            balance: reportedBalance,
          });
          mapping.last_synced_at = new Date();
          await this.remoteAccounts.save(mapping);
          return true;
        } catch {
          this.logger.warn(
            `BankSync account sync failed for ${mapping.remote_account_id}`,
          );
          return mapping.remote_account_id;
        }
      }),
    );
    for (const result of results) {
      if (result === true) accountsSynced += 1;
      else if (typeof result === 'string') errors.push(result);
    }
    return { accountsSynced, errors };
  }

  private async getTransactionsForMapping(
    userId: string,
    apiKey: string,
    bankId: string,
    accountId: string,
    lastSyncedAt: Date | null,
  ) {
    const to = new Date().toISOString().slice(0, 10);
    const fromDate = lastSyncedAt ? new Date(lastSyncedAt) : new Date();
    if (lastSyncedAt)
      fromDate.setUTCDate(fromDate.getUTCDate() - SYNC_OVERLAP_DAYS);
    else fromDate.setUTCFullYear(fromDate.getUTCFullYear() - HISTORY_YEARS);
    const from = fromDate.toISOString().slice(0, 10);
    return await this.client.getTransactions(
      apiKey,
      bankId,
      accountId,
      from,
      to,
      userId,
    );
  }

  private async persistRemoteData({
    bank,
    account,
    mapping,
    localAccount,
    transactions,
    removedTransactionIds,
    balance,
  }: {
    bank: BankSyncBank;
    account: BankSyncRemoteAccount;
    mapping: BankSyncAccount;
    localAccount: Account;
    transactions: BankSyncRemoteTransaction[];
    removedTransactionIds: string[];
    balance: { amount: number; currency: string } | null;
  }) {
    if (balance) {
      localAccount.balance = Money.fromCurrencyCode({
        amount: balance.amount,
        currencyCode: balance.currency,
      }).amount;
      localAccount.currency = balance.currency;
    }
    localAccount.name = account.name ?? account.accountName ?? bank.name;
    await this.accounts.save(localAccount);

    const transactionIds = new Set(
      transactions.map((transaction) => transaction.id),
    );
    const removedIds = new Set(removedTransactionIds);
    for (const transaction of transactions) {
      if (transaction.pendingTransactionId) {
        removedIds.add(transaction.pendingTransactionId);
      }
    }
    for (const transactionId of transactionIds) {
      removedIds.delete(transactionId);
    }
    if (removedIds.size > 0) {
      await this.transactions.delete({
        externalId: In(
          [...removedIds].map(
            (id) =>
              `banksync:${mapping.user_id}:${mapping.remote_bank_id}:${mapping.remote_account_id}:${id}`,
          ),
        ),
      });
    }
    const rows = transactions.map((transaction) => {
      const currency = transaction.currency ?? localAccount.currency;
      const money = Money.fromCurrencyCode({
        amount: Number(transaction.amount),
        currencyCode: currency,
      });
      const date = /^\d{4}-\d{2}-\d{2}$/.test(transaction.date)
        ? new Date(`${transaction.date}T12:00:00.000Z`)
        : new Date(transaction.date);
      return {
        accountId: localAccount.id,
        externalId: `banksync:${mapping.user_id}:${mapping.remote_bank_id}:${mapping.remote_account_id}:${transaction.id}`,
        amount: money.amount,
        currency: money.currency.code,
        date,
        description:
          transaction.merchant ??
          transaction.description ??
          transaction.name ??
          '',
        metadata: { provider: 'banksync' as const, data: transaction },
      };
    });
    if (rows.length) {
      await this.transactions.upsert(rows, {
        conflictPaths: ['externalId'],
        skipUpdateIfNoValuesChanged: true,
      });
    }
  }

  private remoteBalance(account: BankSyncRemoteAccount) {
    const amount = account.balance ?? account.currentBalance;
    if (amount === undefined || amount === null || !account.currency)
      return null;
    return { amount: Number(amount), currency: account.currency };
  }

  private remoteAccountId(account: BankSyncRemoteAccount): string | null {
    const id = account.id ?? account.accountId;
    return id === undefined || id === null ? null : String(id);
  }

  private remoteKey(bankId: string, accountId: string) {
    return `${bankId}\u0000${accountId}`;
  }

  private isUniqueConstraintError(error: unknown): boolean {
    if (typeof error !== 'object' || error === null) return false;
    const driverError = (error as { driverError?: { code?: string } })
      .driverError;
    return driverError?.code === '23505';
  }

  private async getApiKey(userId: string): Promise<string> {
    const credential = await this.credentials
      .createQueryBuilder('credential')
      .addSelect('credential.encrypted_api_key')
      .where('credential.user_id = :userId', { userId })
      .getOne();
    if (!credential)
      throw new NotFoundException('BankSync key is not configured');
    try {
      return this.cipher.decrypt(credential.encrypted_api_key);
    } catch {
      throw new BadGatewayException('BankSync key could not be decrypted');
    }
  }
}
