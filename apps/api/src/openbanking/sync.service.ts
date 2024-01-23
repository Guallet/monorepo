import {
  BadGatewayException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NordigenAccount } from './entities/nordigen-account.entity';
import { NordigenService } from 'src/nordigen/nordigen.service';
import { Account } from 'src/accounts/entities/account.entity';
import { getMoneyBalanceFrom } from 'src/nordigen/dto/nordigen-balances.helper';
import { Transaction } from 'src/transactions/entities/transaction.entity';
import { InstitutionsService } from 'src/institutions/institutions.service';
import { NordigenInstitutionDto } from 'src/nordigen/dto/nordigen-institution.dto';
import { Institution } from 'src/institutions/entities/institution.entity';

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
    private nordigenAccountsRepository: Repository<NordigenAccount>,
    @InjectRepository(Account)
    private accountsRepository: Repository<Account>,
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
    private nordigenService: NordigenService,
    private institutionsService: InstitutionsService,
  ) {}

  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT, {
    name: CRON_JOB_SYNC_INSTITUTIONS_NAME,
    timeZone: CRON_JOB_TIMEZONE,
  })
  syncOpenBankingInstitutions() {
    this.logger.log('Syncing Nordigen institutions via cron job');
    this.syncOpenBankingInstitutionsFromNordigen();
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
      this.institutionsService.saveAll(entities);
    }
    this.logger.log('Syncing Open Banking institutions completed');
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    name: CRON_JOB_SYNC_ACCOUNTS_NAME,
    timeZone: CRON_JOB_TIMEZONE,
  })
  syncAccountsCronJob() {
    this.logger.log('Syncing accounts via cron job');
    this.syncConnectedAccounts();
  }

  async syncConnectedAccounts(): Promise<SyncAccountsResult> {
    // Get all connected accounts
    const accounts = await this.nordigenAccountsRepository.find({
      where: {
        metadata_status: 'READY',
      },
    });

    const errors = [];

    for (const account of accounts) {
      try {
        await this.syncNordigenAccount(account.id);
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
      await this.syncAccountTransactions(nordigenAccount);

      // Update nordigen account
      nordigenAccount.last_refreshed = new Date();
      await this.nordigenAccountsRepository.save(nordigenAccount);

      // Update the DB account
      nordigenAccount.last_refreshed = new Date();
      await this.nordigenAccountsRepository.save(nordigenAccount);
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
        this.accountsRepository.save(guallet_account);
      }

      if (balance === null) {
        this.logger.error(
          `Account Balance not found for account: ${nordigen_account.id}`,
        );
      } else {
        guallet_account.balance = balance.amount;
        this.accountsRepository.save(guallet_account);
      }
    } catch (error) {
      console.error(
        `Error refreshing Nordigen Account Balance: ${nordigen_account.id}`,
        error,
      );
      throw error;
    }
  }

  private async syncAccountTransactions(account: NordigenAccount) {
    try {
      this.logger.log(`Syncing Account Transactions:${account.id}`);

      // TODO: As we know the last sync date, should we only sync the transactions since then?
      const transactions = await this.nordigenService.getAccountTransactions(
        account.id,
      );

      // Convert from NordigenTransaction to Guallet Transaction
      const data = transactions.map((t) =>
        Transaction.fromNordigenDto(account.linked_account_id, t),
      );
      await this.transactionsRepository.upsert(data, {
        conflictPaths: ['externalId'],
        skipUpdateIfNoValuesChanged: true,
      });
    } catch (error) {
      console.error(
        `Error refreshing Nordigen Account Transactions: ${account.id}`,
        error,
      );
      throw error;
    }
  }
}
