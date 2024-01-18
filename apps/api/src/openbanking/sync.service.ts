import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NordigenAccount } from './entities/nordigen-account.entity';
import { OpenbankingService } from './openbanking.service';

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);

  constructor(
    @InjectRepository(NordigenAccount)
    private nordigenAccountsRepository: Repository<NordigenAccount>,
    private openBankingService: OpenbankingService, // private nordigenAccountsRepository: NordigenAccountRepository,
  ) {}

  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT, {
    name: 'cron.institutions.sync',
    timeZone: 'Europe/London',
  })
  async syncOpenBankingInstitutions() {
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

    this.logger.debug('Syncing Open Banking institutions completed');
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    name: 'cron.accounts.sync',
    timeZone: 'Europe/London',
  })
  syncAccountsCronJob() {
    this.logger.debug('Syncing accounts via cron job');
    this.syncConnectedAccounts();
  }

  async syncConnectedAccounts() {
    // Get all connected accounts
    const accounts = await this.nordigenAccountsRepository.find();
    for (const account of accounts) {
      await this.openBankingService.syncAccountTransactions(account.id);
    }

    this.logger.debug(
      `Transactions sync completed => Accounts synced: ${accounts.length}`,
    );
  }
}
