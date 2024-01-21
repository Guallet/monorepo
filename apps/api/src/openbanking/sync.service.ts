import {
  BadGatewayException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NordigenAccount } from './entities/nordigen-account.entity';
import { OpenbankingService } from './openbanking.service';
import { NordigenService } from 'src/nordigen/nordigen.service';
import { Account } from 'src/accounts/entities/account.entity';
import {
  Money,
  getBalanceAmountFrom,
  getMoneyBalanceFrom,
} from 'src/nordigen/dto/nordigen-balances.helper';

const CRON_JOB_SYNC_ACCOUNTS_NAME = 'cron.sync.accounts';
const CRON_JOB_SYNC_INSTITUTIONS_NAME = 'cron.sync.institutions';
const CRON_JOB_TIMEZONE = 'Europe/London';

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);

  constructor(
    @InjectRepository(NordigenAccount)
    private nordigenAccountsRepository: Repository<NordigenAccount>,
    @InjectRepository(Account)
    private accountsRepository: Repository<Account>,
    private nordigenService: NordigenService,
    private openBankingService: OpenbankingService, // private nordigenAccountsRepository: NordigenAccountRepository,
  ) {}

  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT, {
    name: CRON_JOB_SYNC_INSTITUTIONS_NAME,
    timeZone: CRON_JOB_TIMEZONE,
  })
  syncOpenBankingInstitutions() {
    // for (const country of this.supportedCountries) {
    //   this.logger.debug(`Syncing Open Banking institutions for ${country}`);
    //   const institutions = await this.nordigenService.getInsitutions(country);
    //   const entities = institutions.map((x: NordigenInstitutionDto) => {
    //     const bank = new Institution();
    //     bank.nordigen_id = x.id;
    //     bank.name = x.name;
    //     bank.image_src = x.logo;
    //     bank.countries = x.countries;

    //     return bank;
    //   });
    //   this.institutionsService.saveAll(entities);
    // }

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

  async syncConnectedAccounts() {
    // Get all connected accounts
    const accounts = await this.nordigenAccountsRepository.find({
      where: {
        metadata_status: 'READY',
      },
    });
    for (const account of accounts) {
      await this.syncNordigenAccount(account.id);
    }

    this.logger.log(
      `Transactions sync completed => Accounts synced: ${accounts.length}`,
    );
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

      const balance = await this.getAccountBalance(nordigenAccount);
      if (balance === null) {
        this.logger.error(
          `Account Balance not found for account: ${nordigenAccount.id}`,
        );
      } else {
        // Update the account balance
        gualletAccount.balance = balance.amount;
        this.accountsRepository.save(gualletAccount);
      }

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

      return account;
    } catch (error) {
      console.error(
        `Error refreshing Nordigen Account Details: ${account.id}`,
        error,
      );
      throw error;
    }
  }

  private async getAccountBalance(account: NordigenAccount): Promise<Money> {
    try {
      this.logger.log(`Syncing Account Balance:${account.id}`);

      // Sync the balances
      const balances = await this.nordigenService.getAccountBalance(account.id);

      const balance = getMoneyBalanceFrom(balances);
      return balance;
    } catch (error) {
      console.error(
        `Error refreshing Nordigen Account Balance: ${account.id}`,
        error,
      );
      throw error;
    }
  }
}
