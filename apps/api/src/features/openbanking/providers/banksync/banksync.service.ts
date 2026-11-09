import { persistBankTransactions } from '../../../transactions/persist-bank-transactions';
import {
  BankProviderAdapter,
  ProviderContext,
  ProviderAccount,
  ProviderIdentity,
  requireApiKey,
} from '../bank-provider.interface';
import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Account } from 'src/features/accounts/entities/account.entity';
import { AccountSource } from 'src/features/accounts/entities/accountSource.model';
import { AccountType } from 'src/features/accounts/entities/accountType.model';
import { Transaction } from 'src/features/transactions/entities/transaction.entity';
import { In, Repository } from 'typeorm';
import { BankSyncClient } from './banksync.client';
import type {
  BankSyncBank,
  BankSyncRemoteAccount,
  BankSyncRemoteTransaction,
} from './types';
import { ConnectedAccount } from '../../entities/connected-account.entity';
import { connectionStatusFromProvider } from '../../models/bank-connection-state.model';

const HISTORY_YEARS = 7;
const SYNC_OVERLAP_DAYS = 7;

@Injectable()
export class BankSyncService implements BankProviderAdapter {
  private readonly logger = new Logger(BankSyncService.name);

  constructor(
    @InjectRepository(ConnectedAccount)
    private readonly remoteAccounts: Repository<ConnectedAccount>,
    @InjectRepository(Account)
    private readonly accounts: Repository<Account>,
    @InjectRepository(Transaction)
    private readonly transactions: Repository<Transaction>,
    private readonly client: BankSyncClient,
  ) {}

  async validateCredentials({
    userId,
    credentials,
  }: ProviderContext): Promise<void> {
    const apiKey = requireApiKey(credentials);
    await this.client.getBanks(apiKey, userId);
  }

  async disconnect({ userId }: ProviderIdentity): Promise<void> {
    await this.remoteAccounts.update(
      { provider: 'banksync', user_id: userId },
      { is_linked: false },
    );
  }

  async listAccounts({ userId, credentials }: ProviderContext) {
    const apiKey = requireApiKey(credentials);
    const banks = await this.client.getBanks(apiKey, userId);
    const mappings = await this.remoteAccounts.find({
      where: { provider: 'banksync', user_id: userId },
    });
    const linkedByRemoteKey = new Map(
      mappings
        .filter((mapping) => mapping.is_linked)
        .map((mapping) => [
          mapping.remote_account_id,
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
    const discovered = remoteAccountsByBank.flatMap(({ bank, accounts }) =>
      accounts.flatMap((account) => {
        const id = this.remoteAccountId(account);
        if (!id) return [];
        return [
          {
            id: JSON.stringify([bank.id, id]),
            raw: account,
            name: account.name ?? account.accountName ?? 'Bank account',
            institutionName: bank.name,
            connectionStatus: connectionStatusFromProvider(
              bank.connectionStatus?.errorCode || bank.connectionStatus?.status,
            ),
            currency: account.currency ?? null,
            balance: this.remoteBalance(account)?.amount.toString() ?? null,
            linkedAccountId:
              linkedByRemoteKey.get(this.remoteKey(bank.id, id)) ?? null,
          },
        ];
      }),
    );
    const discoveredIds = new Set(discovered.map((account) => account.id));
    const unavailable = mappings.filter(
      (mapping) =>
        mapping.is_linked && !discoveredIds.has(mapping.remote_account_id),
    );
    if (!unavailable.length) return discovered;
    const localAccounts = await this.accounts.find({
      where: {
        user_id: userId,
        id: In(unavailable.map((mapping) => mapping.guallet_account_id)),
      },
    });
    const localById = new Map(
      localAccounts.map((account) => [account.id, account]),
    );
    const banksById = new Map(banks.map((bank) => [bank.id, bank]));
    const retained: ProviderAccount[] = unavailable.map((mapping) => {
      const local = localById.get(mapping.guallet_account_id);
      const bank = banksById.get(
        decodeBankSyncAccountId(mapping.remote_account_id).bankId,
      );
      return {
        id: mapping.remote_account_id,
        name: local?.name ?? 'Bank account',
        institutionName: bank?.name ?? null,
        currency: local?.currency ?? null,
        linkedAccountId: mapping.guallet_account_id,
        status: 'unavailable',
        connectionStatus:
          connectionStatusFromProvider(bank?.connectionStatus?.status) ===
          'expired'
            ? 'expired'
            : 'connectionError',
      };
    });
    return [...discovered, ...retained];
  }

  async importAccounts({
    userId,
    credentials,
    accountIds,
  }: ProviderContext & { accountIds: string[] }): Promise<string[]> {
    const selections = accountIds.map(decodeBankSyncAccountId);
    const apiKey = requireApiKey(credentials);
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

    // Finish every write before releasing the connection lock, even on failure.
    const imported: string[] = [];
    for (const { bank, account } of [...selected.values()]) {
      const mapping = await this.importRemoteAccount({
        userId,
        apiKey,
        bank,
        account,
      });
      imported.push(mapping.guallet_account_id);
    }
    return imported;
  }

  async sync({ userId, credentials }: ProviderContext) {
    const apiKey = requireApiKey(credentials);
    const mappings = await this.remoteAccounts.find({
      where: { provider: 'banksync', user_id: userId, is_linked: true },
    });
    if (mappings.length === 0)
      return { accountsSynced: 0, errors: [], newUncategorizedCount: 0 };
    return await this.syncMappings(userId, apiKey, mappings);
  }

  async unlinkAccount({
    userId,
    accountId: id,
  }: ProviderIdentity & { accountId: string }): Promise<void> {
    const { bankId, accountId } = decodeBankSyncAccountId(id);
    const result = await this.remoteAccounts.update(
      {
        provider: 'banksync',
        user_id: userId,
        remote_account_id: JSON.stringify([bankId, accountId]),
      },
      { is_linked: false },
    );
    if (!result.affected) throw new NotFoundException();
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
        provider: 'banksync',
        user_id: userId,
        remote_account_id: JSON.stringify([bank.id, remoteId]),
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
      const created = await this.accounts.manager.transaction(
        async (manager) => {
          const createdAccount = await manager.save(Account, {
            user_id: userId,
            name: account.name ?? account.accountName ?? bank.name,
            balance,
            currency,
            type: AccountType.UNKNOWN,
            source: AccountSource.IMPORTED,
            source_name: 'BankSync',
            institutionId: null,
            properties: null,
          });
          const createdMapping = await manager.save(ConnectedAccount, {
            provider: 'banksync',
            user_id: userId,
            remote_connection_id: bank.id,
            remote_account_id: JSON.stringify([bank.id, remoteId]),
            raw: account,
            guallet_account_id: createdAccount.id,
            is_linked: true,
          });

          return { account: createdAccount, mapping: createdMapping };
        },
      );
      localAccount = created.account;
      mapping = created.mapping;
    }
    await this.remoteAccounts.save(mapping);
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
    mappings: ConnectedAccount[],
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
    let newUncategorizedCount = 0;
    const results = await Promise.all(
      mappings.map(async (mapping) => {
        const { bankId, accountId } = decodeBankSyncAccountId(
          mapping.remote_account_id,
        );
        const key = mapping.remote_account_id;
        if (failedBanks.has(bankId)) {
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
              bankId,
              accountId,
              mapping.last_synced_at,
            ),
            this.remoteBalance(remote.account)
              ? Promise.resolve(this.remoteBalance(remote.account))
              : this.client.getBalances(apiKey, bankId, accountId, userId),
          ]);
          const importedCount = await this.persistRemoteData({
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
          return { importedCount };
        } catch {
          this.logger.warn(
            `BankSync account sync failed for ${mapping.remote_account_id}`,
          );
          return mapping.remote_account_id;
        }
      }),
    );
    for (const result of results) {
      if (typeof result === 'string') errors.push(result);
      else {
        accountsSynced += 1;
        newUncategorizedCount += result.importedCount;
      }
    }
    return { accountsSynced, errors, newUncategorizedCount };
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
    mapping: ConnectedAccount;
    localAccount: Account;
    transactions: BankSyncRemoteTransaction[];
    removedTransactionIds: string[];
    balance: { amount: number; currency: string } | null;
  }) {
    const { bankId, accountId } = decodeBankSyncAccountId(
      mapping.remote_account_id,
    );
    mapping.raw = account;
    mapping.remote_connection_id = bankId;
    await this.remoteAccounts.save(mapping);
    if (balance) {
      localAccount.balance = balance.amount;
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
            (id) => `banksync:${mapping.user_id}:${bankId}:${accountId}:${id}`,
          ),
        ),
      });
    }
    const rows = transactions.map((transaction) => {
      const currency = transaction.currency ?? localAccount.currency;
      const date = /^\d{4}-\d{2}-\d{2}$/.test(transaction.date)
        ? new Date(`${transaction.date}T12:00:00.000Z`)
        : new Date(transaction.date);
      return {
        accountId: localAccount.id,
        externalId: `banksync:${mapping.user_id}:${bankId}:${accountId}:${transaction.id}`,
        amount: Number(transaction.amount),
        currency,
        date,
        description:
          transaction.merchant ??
          transaction.description ??
          transaction.name ??
          '',
        metadata: { provider: 'banksync' as const, data: transaction },
      };
    });
    return await persistBankTransactions(
      this.transactions,
      localAccount.id,
      rows,
    );
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
    return JSON.stringify([bankId, accountId]);
  }
}

export function decodeBankSyncAccountId(value: string): {
  bankId: string;
  accountId: string;
} {
  try {
    const parsed: unknown = JSON.parse(value);
    if (
      Array.isArray(parsed) &&
      parsed.length === 2 &&
      typeof parsed[0] === 'string' &&
      parsed[0] &&
      typeof parsed[1] === 'string' &&
      parsed[1]
    ) {
      return { bankId: parsed[0], accountId: parsed[1] };
    }
  } catch {
    /* Report the same error for invalid JSON and invalid identifiers. */
  }
  throw new BadRequestException('Invalid provider account id');
}
