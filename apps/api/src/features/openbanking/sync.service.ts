import {
  BadGatewayException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { NordigenAccount } from './entities/nordigen-account.entity.js';
import { NordigenService } from '../../features/nordigen/nordigen.service.js';
import { Account } from '../../features/accounts/entities/account.entity.js';
import { getMoneyBalanceFrom } from '../../features/nordigen/dto/nordigen-balances.helper.js';
import { Transaction } from '../../features/transactions/entities/transaction.entity.js';
import { InstitutionsService } from '../../features/institutions/institutions.service.js';
import { NordigenInstitutionDto } from '../../features/nordigen/dto/nordigen-institution.dto.js';
import { Institution } from '../../features/institutions/entities/institution.entity.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import { NotificationType } from '../notifications/entities/notification.entity.js';

const CRON_JOB_SYNC_ACCOUNTS_NAME = 'cron.sync.accounts';
const CRON_JOB_SYNC_INSTITUTIONS_NAME = 'cron.sync.institutions';
const CRON_JOB_TIMEZONE = 'Europe/London';

// Refactor this. Maybe saved in the DB?
export const supportedCountries = [
  'AT', // Austria
  'BE', // Belgium
  'BG', // Bulgaria
  'HR', // Croatia
  'CY', // Cyprus
  'CZ', //Czechia
  'DK', //Denmark
  'EE', //Estonia
  'FI', //Finland
  'FR', //France
  'DE', //Germany
  'GR', //Greece
  'HU', //Hungary
  'IS', //Iceland
  'IE', //Ireland
  'IT', //Italy
  'LV', //Latvia
  'LI', //Liechtenstein
  'LT', //Lithuania
  'LU', //Luxembourg
  'MT', //Malta
  'NL', //Netherlands
  'NO', //Norway
  'PL', //Poland
  'PT', //Portugal
  'RO', //Romania
  'SK', //Slovakia
  'SI', //Slovenia
  'ES', //Spain
  'SE', //Sweden
  'GB', //United Kingdom
];

export type SyncAccountsResult = {
  accounts_synced: number;
  errors: string[];
};

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);

  constructor(
    @InjectRepository(NordigenAccount)
    private readonly nordigenAccountsRepository: Repository<NordigenAccount>,
    @InjectRepository(Account)
    private readonly accountsRepository: Repository<Account>,
    @InjectRepository(Transaction)
    private readonly transactionsRepository: Repository<Transaction>,
    private readonly nordigenService: NordigenService,
    private readonly institutionsService: InstitutionsService,
    private readonly notificationsService: NotificationsService,
  ) {}

  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT, {
    name: CRON_JOB_SYNC_INSTITUTIONS_NAME,
    timeZone: CRON_JOB_TIMEZONE,
  })
  async syncOpenBankingInstitutions(): Promise<void> {
    this.logger.log('Syncing Nordigen institutions via cron job');
    await this.syncOpenBankingInstitutionsFromNordigen();
  }

  async syncOpenBankingInstitutionsFromNordigen() {
    for (const country of supportedCountries) {
      this.logger.log(
        `Syncing Open Banking institutions for country: ${country}`,
      );
      const institutions = await this.nordigenService.getInstitutions(country);
      const entities = institutions.map((x: NordigenInstitutionDto) => {
        const bank = new Institution();
        bank.nordigen_id = x.id;
        bank.name = x.name;
        bank.image_src = x.logo;
        bank.countries = x.countries;

        return bank;
      });
      await this.institutionsService.saveAll(entities);
    }
    this.logger.log('Syncing Open Banking institutions completed');
  }

  @Cron(CronExpression.EVERY_DAY_AT_3AM, {
    name: CRON_JOB_SYNC_ACCOUNTS_NAME,
    timeZone: CRON_JOB_TIMEZONE,
  })
  syncAccountsCronJob() {
    this.logger.log('Syncing accounts via cron job');
    void this.syncConnectedAccounts(); //Fire and forget
  }

  async syncConnectedAccounts(): Promise<SyncAccountsResult> {
    // Get all connected accounts
    const accounts = await this.nordigenAccountsRepository.find({
      where: {
        metadata_status: 'READY',
      },
    });

    const errors: string[] = [];
    const pendingCategorizationByUser = new Map<string, number>();

    for (const account of accounts) {
      try {
        const syncResult = await this.syncNordigenAccount(account.id);
        if (syncResult.userId && syncResult.newUncategorizedCount > 0) {
          const current =
            pendingCategorizationByUser.get(syncResult.userId) ?? 0;
          pendingCategorizationByUser.set(
            syncResult.userId,
            current + syncResult.newUncategorizedCount,
          );
        }
      } catch (error) {
        if (error instanceof UnauthorizedException) {
          errors.push(
            `Access to '${account.id}' has expired or it has been revoked`,
          );
        } else {
          this.logger.error(
            `Error syncing Nordigen Account: ${account.id}`,
            error,
          );
          errors.push(`Error syncing Nordigen Account: ${account.id}`);
        }
      }
    }

    for (const [userId, newTransactionsCount] of pendingCategorizationByUser) {
      await this.sendCategorizationNotification({
        userId,
        newTransactionsCount,
      });
    }

    const result = {
      accounts_synced: accounts.length,
      errors: errors,
    } as SyncAccountsResult;

    this.logger.log(
      `Accounts sync completed => Accounts synced: ${JSON.stringify(result)}`,
    );

    return result;
  }

  async syncNordigenAccount(account_id: string) {
    try {
      console.log(`Syncing Nordigen Account: ${account_id}`);
      // Get the accounts from the DB
      const nordigenAccount = await this.nordigenAccountsRepository.findOne({
        where: {
          id: account_id,
        },
      });

      if (nordigenAccount === null) {
        this.logger.error(`Nordigen Account with id '${account_id}' not found`);
        throw new NotFoundException(`Account not found`);
      }

      // Validate the account can be updated
      if (nordigenAccount.metadata_status !== 'READY') {
        this.logger.error(
          `Nordigen Account with id '${account_id}' is not ready for sync`,
        );
        throw new BadGatewayException();
      }

      // Get the linked guallet account in the DB
      if (
        nordigenAccount.linked_account_id === null ||
        nordigenAccount.linked_account_id === undefined
      ) {
        this.logger.error(
          `Nordigen Account with id '${account_id}' has no linked account`,
        );
        throw new NotFoundException(`Account mismatch: app account not found`);
      }
      const gualletAccount = await this.accountsRepository.findOne({
        where: {
          id: nordigenAccount.linked_account_id,
        },
      });

      if (gualletAccount === null) {
        this.logger.error(`Account with id '${account_id}' not found`);
        // TODO: Do we need to delete this Nordigen account as there is no matching account in the app?
        throw new NotFoundException(`Account mismatch: app account not found`);
      }

      // Get the new data from Nordigen
      await this.updateNordigenAccountMetadata(nordigenAccount);
      await this.updateNordigenAccountDetails(nordigenAccount);
      await this.syncAccountBalance(nordigenAccount, gualletAccount);

      // Sync the transactions
      const newUncategorizedCount =
        await this.syncAccountTransactions(nordigenAccount);

      // Update nordigen account
      nordigenAccount.last_refreshed = new Date();
      await this.nordigenAccountsRepository.save(nordigenAccount);

      // Update the DB account
      nordigenAccount.last_refreshed = new Date();
      await this.nordigenAccountsRepository.save(nordigenAccount);

      return {
        userId: gualletAccount.user_id,
        newUncategorizedCount,
      };
    } catch (error) {
      console.error(`Error syncing Nordigen Account: ${account_id}`, error);
      throw error;
    }
  }

  private async updateNordigenAccountMetadata(
    account: NordigenAccount,
  ): Promise<NordigenAccount> {
    try {
      // Refresh the account metadata
      const metadata = await this.nordigenService.getAccountMetadata(
        account.id,
      );

      account.metadata_raw = metadata;
      account.metadata_status = metadata.status;

      // Save the account in the DB with the new metadata
      await this.nordigenAccountsRepository.save(account);

      return account;
    } catch (error) {
      console.error(
        `Error refreshing Nordigen Account Metadata: ${account.id}`,
        error,
      );
      throw error;
    }
  }

  private async updateNordigenAccountDetails(
    account: NordigenAccount,
  ): Promise<NordigenAccount> {
    try {
      const details = await this.nordigenService.getAccountDetails(account.id);

      // Update the DB account
      account.details_raw = details;
      account.status = details.status;
      // The rest of the details should not be changed as they are "immutable"

      // Save the account in the DB with the new details
      await this.nordigenAccountsRepository.save(account);

      return account;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        // "Access has expired or it has been revoked. To restore access reconnect the account.",
        console.error(
          `Access has expired or it has been revoked. To restore access reconnect the account ${account.id}`,
          error,
        );
        throw error;
      } else {
        console.error(
          `Error refreshing Nordigen Account Details: ${account.id}`,
          error,
        );
        throw error;
      }
    }
  }

  private async syncAccountBalance(
    nordigen_account: NordigenAccount,
    guallet_account: Account,
  ) {
    try {
      this.logger.log(`Syncing Account Balance:${nordigen_account.id}`);

      // Sync the balances
      const balances = await this.nordigenService.getAccountBalance(
        nordigen_account.id,
      );

      const balance = getMoneyBalanceFrom(balances);

      if (balance === null) {
        this.logger.error(
          `Account Balance not found for account: ${nordigen_account.id}`,
        );
      } else {
        // Update the account balance
        guallet_account.balance = balance.amount;
        await this.accountsRepository.save(guallet_account);
      }

      if (balance === null) {
        this.logger.error(
          `Account Balance not found for account: ${nordigen_account.id}`,
        );
      } else {
        guallet_account.balance = balance.amount;
        await this.accountsRepository.save(guallet_account);
      }
    } catch (error) {
      console.error(
        `Error refreshing Nordigen Account Balance: ${nordigen_account.id}`,
        error,
      );
      throw error;
    }
  }

  private async syncAccountTransactions(
    account: NordigenAccount,
  ): Promise<number> {
    try {
      this.logger.log(`Syncing Account Transactions:${account.id}`);
      const { linked_account_id } = account;

      if (linked_account_id == null) {
        this.logger.error(
          `Nordigen Account with id '${account.id}' has no linked account`,
        );
        throw new NotFoundException(`Account mismatch: app account not found`);
      }

      // TODO: As we know the last sync date, should we only sync the transactions since then?
      const transactions = await this.nordigenService.getAccountTransactions(
        account.id,
      );

      // Convert from NordigenTransaction to Guallet Transaction
      const data = transactions.map((t) =>
        Transaction.fromNordigenDto(linked_account_id, t),
      );

      const incomingExternalIds = data
        .map((transaction) => transaction.externalId)
        .filter((externalId): externalId is string => Boolean(externalId));

      const existingExternalIdSet = new Set<string>();
      if (incomingExternalIds.length > 0) {
        const existingTransactions = await this.transactionsRepository.find({
          select: { externalId: true },
          where: {
            accountId: linked_account_id,
            externalId: In(incomingExternalIds),
          },
        });

        existingTransactions.forEach((transaction) => {
          if (transaction.externalId) {
            existingExternalIdSet.add(transaction.externalId);
          }
        });
      }

      const newUncategorizedCount = data.filter(
        (transaction) =>
          transaction.externalId &&
          !existingExternalIdSet.has(transaction.externalId) &&
          transaction.categoryId == null,
      ).length;

      await this.transactionsRepository.upsert(data, {
        conflictPaths: ['externalId'],
        skipUpdateIfNoValuesChanged: true,
      });

      return newUncategorizedCount;
    } catch (error) {
      console.error(
        `Error refreshing Nordigen Account Transactions: ${account.id}`,
        error,
      );
      throw error;
    }
  }

  private async sendCategorizationNotification({
    userId,
    newTransactionsCount,
  }: {
    userId: string;
    newTransactionsCount: number;
  }): Promise<void> {
    try {
      await this.notificationsService.createSystemNotification({
        userId,
        message: `You have ${newTransactionsCount} new transactions to categorize`,
        icon: '👆',
        type: NotificationType.ACTION_REQUIRED,
        action: '/transactions/inbox',
      });
    } catch (error) {
      this.logger.error(
        `Failed to create nightly sync categorization notification for user ${userId}`,
        error,
      );
    }
  }
}
