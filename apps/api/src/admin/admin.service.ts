import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Account } from 'src/accounts/entities/account.entity';
import { AccountRepository } from 'src/accounts/repositories/account.repository';
import {
  AccountCreatedEvent,
  ACCOUNT_ADDED,
} from 'src/core/events/events.const';
import { Institution } from 'src/institutions/entities/insititution.entity';
import { InstitutionsService } from 'src/institutions/institutions.service';
import { NordigenInstitutionDto } from 'src/nordigen/dto/institution.dto';
import { NordigenService } from 'src/nordigen/nordigen.service';
import { getBalanceAmountFrom } from 'src/openbanking/helpers/nordigen-balances.helper';
import { NordigenAccountRepository } from 'src/openbanking/repositories/nordigenAccount.repository';
import { transactionFromNordigen } from 'src/transactions/entities/transaction.entity';
import { TransactionRepository } from 'src/transactions/transaction.repository';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private nordigenService: NordigenService,
    private institutionsService: InstitutionsService,
    private accountsRepository: AccountRepository,
    private nordigenAccountRepository: NordigenAccountRepository,
    private transactionsRepository: TransactionRepository,
  ) {}

  // TODO: This is already defined in OpenBankingService
  // Refactor the code so this is not duplicated. Maybe saved in the DB?
  private supportedCountries = [
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

  async syncOpenBankingInstitutions() {
    for (const country of this.supportedCountries) {
      this.logger.debug(`Syncing Open Banking institutions for ${country}`);
      const institutions = await this.nordigenService.getInsitutions(country);
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

    this.logger.debug('Syncing Open Banking institutions completed');
  }

  @OnEvent(ACCOUNT_ADDED, { async: true })
  async handleOrderCreatedEvent(payload: AccountCreatedEvent) {
    const account = await this.accountsRepository.find(payload.id);
    if (account != null) {
      await this.syncAccount(account.id);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_3AM, {
    name: 'cron.accounts.sync',
    timeZone: 'Europe/London',
  })
  syncAccounts() {
    this.syncConnectedAccounts();
  }

  async syncConnectedAccounts() {
    // Get all connected accounts
    const accounts = await this.accountsRepository.findAllConnectedAccounts();
    this.logger.debug(
      'Syncing accounts',
      accounts.map((x) => `Account id: ${x.id}`),
    );
    for (const account of accounts) {
      await this.syncAccount(account.id);
    }

    this.logger.debug(
      `Transactions sync completed => Accounts synced: ${accounts.length}`,
    );
    return accounts;
  }

  async syncAccount(accountId: string) {
    const account = await this.accountsRepository.find(accountId);
    if (
      account.nordigenAccount === null ||
      account.nordigenAccount === undefined
    ) {
      // Nothing to sync
      return;
    }
    this.logger.debug(
      `Syncing account ${account.id} : Nordigen Id: ${account.nordigenAccount.id}`,
    );
    // Sync the balances
    const balances = await this.nordigenService.getAccountBalance(
      account.nordigenAccount.id,
    );
    account.balance = getBalanceAmountFrom(balances);
    await this.accountsRepository.save(account);

    // Sync the transactions
    const transactions = await this.nordigenService.getAccountTransactions(
      account.nordigenAccount.id,
    );

    // Convert from NordigenTransaction to Guallet Transaction
    const data = transactions.map((t) => transactionFromNordigen(t, account));
    this.transactionsRepository.saveAll(data);

    // Update nordigen account
    const nordigenAccount = await this.nordigenAccountRepository.find(
      account.nordigenAccount.id,
    );
    nordigenAccount.last_refreshed = new Date();
    await this.nordigenAccountRepository.save(nordigenAccount);
  }
}
