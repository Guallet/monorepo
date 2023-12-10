import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { NordigenRequisitionDto } from 'src/nordigen/dto/nordigen-requisition.dto';
import { ObConnection } from './entities/connection.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { NordigenAccountRepository } from './repositories/nordigen-account.repository';
import { NordigenService } from 'src/nordigen/nordigen.service';
import { NordigenAccount } from './entities/nordigen-account.entity';
import { Account } from 'src/accounts/models/account.model';
import { getBalanceAmountFrom } from 'src/nordigen/dto/nordigen-balances.helper';
import { getAccountTypeFrom } from 'src/nordigen/dto/ExternalCashAccountType1Code.helper';
import { supportedCountries } from 'src/admin/admin.service';

@Injectable()
export class OpenbankingService {
  private readonly logger = new Logger(OpenbankingService.name);

  constructor(
    @InjectRepository(ObConnection)
    private repository: Repository<ObConnection>,
    private nordigenService: NordigenService,
    private nordigenAccountsRepository: NordigenAccountRepository,
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
  ) {}

  async getAvailableCountries(locale: string) {
    return supportedCountries.map((code) => {
      const regionNames = new Intl.DisplayNames([locale], {
        type: 'region',
      });

      return {
        code: code,
        name: regionNames.of(code),
      };
    });
  }

  async saveRequisition(user_id: string, dto: NordigenRequisitionDto) {
    const connection = new ObConnection();
    connection.id = dto.id;
    connection.created = dto.created;
    connection.redirect = dto.redirect;
    connection.status = dto.status;
    connection.institution_id = dto.institution_id;
    connection.agreement = dto.agreement;
    connection.reference = dto.reference;
    connection.user_id = user_id;
    connection.accounts = dto.accounts;
    connection.user_language = dto.user_language;
    connection.link = dto.link;
    connection.ssn = dto.ssn;
    connection.account_selection = dto.account_selection;
    connection.redirect_immediate = dto.redirect_immediate;
    await this.repository.save(connection);
  }

  async getConnections(user_id: string) {
    return await this.repository.find({
      where: {
        user_id: user_id,
      },
    });
  }

  async connectToAccounts(userId: string, accountIds: string[]) {
    try {
      for (const accountId of accountIds) {
        await this.connectToAccount(userId, accountId);
      }

      return {
        accounts_count: accountIds.length,
      };
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  // Should this method just deal with the "Nordige Accounts" and
  // leave the app accounts alone?
  async connectToAccount(user_id: string, nordigen_accountId: string) {
    // If there is an existing account linked to this nordigen account, dont create it again
    const existingAccount = await this.nordigenAccountsRepository.find(
      nordigen_accountId,
    );

    // Get nordigen account metadata
    this.logger.debug(`Getting Account Metadata: ${nordigen_accountId}`);
    const metadata = await this.nordigenService.getAccountMetadata(
      nordigen_accountId,
    );
    this.logger.debug(`Getting Account balances: ${nordigen_accountId}`);
    const balances = await this.nordigenService.getAccountBalance(
      nordigen_accountId,
    );
    this.logger.debug(`Getting Account details: ${nordigen_accountId}`);
    const details = await this.nordigenService.getAccountDetails(
      nordigen_accountId,
    );

    this.logger.debug(
      `Getting Account institution: ${metadata.institution_id}`,
    );

    // Creates the app account
    const tmpAccount = await this.accountRepository.findOne({
      where: {
        user_id: user_id,
        id: existingAccount?.accountId,
      },
    });
    let account = tmpAccount ?? new Account();
    if (account.id == null) {
      account.user_id = user_id;
      account.name = details.name ?? details.ownerName;
      account.currency = details.currency;
      account.balance = getBalanceAmountFrom(balances);
      account.institutionId = metadata.institution_id;
      account.type = getAccountTypeFrom(details.cashAccountType);
    } else {
      account.balance = getBalanceAmountFrom(balances);
    }

    this.logger.debug(`Creating or updating new account`);
    account = await this.accountRepository.save(account);

    // Creates the nordigen account
    const nordigenAccount = existingAccount ?? new NordigenAccount();
    nordigenAccount.id = nordigen_accountId;
    nordigenAccount.accountId = account.id;
    nordigenAccount.resource_id = details.resourceId;
    nordigenAccount.currency = details.currency;
    nordigenAccount.institution_id = metadata.institution_id;
    nordigenAccount.owner_name = details.ownerName;
    nordigenAccount.cashAccountType = details.cashAccountType;
    nordigenAccount.maskedPan = details.maskedPan;
    nordigenAccount.details = details.details;
    nordigenAccount.name = details.name;
    nordigenAccount.bic = details.bic;
    nordigenAccount.iban = details.iban;
    nordigenAccount.status = details.status;

    this.logger.debug(`Saving Nordigen Account`);
    await this.nordigenAccountsRepository.save(nordigenAccount);

    // TODO: Trigger event to start syncing the account
    // this.eventEmitter.emit(
    //   ACCOUNT_ADDED,
    //   new AccountCreatedEvent({
    //     id: account.id,
    //   }),
    // );

    return {
      account: account,
      open_banking_account: nordigenAccount,
    };
  }
}
