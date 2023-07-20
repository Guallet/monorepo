import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Account } from 'src/accounts/entities/account.entity';
import { AccountRepository } from 'src/accounts/repositories/account.repository';
import { InstitutionRepository } from 'src/institutions/institution.repository';
import { NordigenAccountDto } from 'src/nordigen/dto/account.dto';
import { RequisitionDto } from 'src/nordigen/dto/requisition.dto';
import { NordigenService } from 'src/nordigen/nordigen.service';
import { NordigenAccount } from './entities/nordigenAccount.entity';
import { NordigenRequisition } from './entities/nordigenRequisition.entity';
import { getAccountTypeFrom } from './helpers/ExternalCashAccountType1Code.helper';
import { getBalanceAmountFrom } from './helpers/nordigen-balances.helper';
import { NordigenAccountRepository } from './repositories/nordigenAccount.repository';
import { RequisitionRepository } from './repositories/requisition.repository';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  AccountCreatedEvent,
  ACCOUNT_ADDED,
} from 'src/core/events/events.const';

@Injectable()
export class OpenbankingService {
  private readonly logger = new Logger(OpenbankingService.name);

  constructor(
    private eventEmitter: EventEmitter2,
    private nordigenService: NordigenService,
    private requisitionRepository: RequisitionRepository,
    private nordigenAccountsRepository: NordigenAccountRepository,
    private accountRepository: AccountRepository,
    private institutionsRepository: InstitutionRepository,
  ) {}

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

  async getAvailableCountries(locale: string) {
    return this.supportedCountries.map((code) => {
      const regionNames = new Intl.DisplayNames([locale], {
        type: 'region',
      });

      return {
        code: code,
        name: regionNames.of(code),
      };
    });
  }

  async getInsitutions(countyCode: string) {
    return this.nordigenService.getInsitutions(countyCode);
  }

  async saveRequisition(userId: string, dto: RequisitionDto) {
    const requisition = new NordigenRequisition();
    requisition.id = dto.id;
    requisition.created = dto.created;
    requisition.redirect = dto.redirect;
    requisition.status = dto.status;
    requisition.institution_id = dto.institution_id;
    requisition.agreement = dto.agreement;
    requisition.reference = dto.reference;
    requisition.user_id = userId;
    requisition.accounts = dto.accounts;
    requisition.user_language = dto.user_language;
    requisition.link = dto.link;
    requisition.ssn = dto.ssn;
    requisition.account_selection = dto.account_selection;
    requisition.redirect_immediate = dto.redirect_immediate;
    this.requisitionRepository.save(requisition);
  }

  async getRequisitionAccounts(
    userId: string,
    requisitionId: string,
  ): Promise<NordigenAccountDto[]> {
    const dto = await this.nordigenService.getRequisition(requisitionId);
    const requisition = new NordigenRequisition();
    requisition.id = dto.id;
    requisition.created = dto.created;
    requisition.redirect = dto.redirect;
    requisition.status = dto.status;
    requisition.institution_id = dto.institution_id;
    requisition.agreement = dto.agreement;
    requisition.reference = dto.reference;
    requisition.user_id = userId;
    requisition.accounts = dto.accounts;
    requisition.user_language = dto.user_language;
    requisition.link = dto.link;
    requisition.ssn = dto.ssn;
    requisition.account_selection = dto.account_selection;
    requisition.redirect_immediate = dto.redirect_immediate;
    await this.requisitionRepository.update(requisition);

    // Update the accounts info and Return the accounts
    const getAccountInfo = async (accountId) => {
      return {
        id: accountId,
        ...(await this.nordigenService.getAccountDetails(accountId)),
      };
    };
    const accountIds = requisition.accounts;

    const accounts = await Promise.all(
      accountIds.map((x) => getAccountInfo(x)),
    );

    return accounts;
  }

  async connectToAccounts(userId: string, accountIds: string[]) {
    const tasks = accountIds.map((accountId) => {
      this.connectToAccount(userId, accountId);
    });

    await Promise.all(tasks)
      .then(() => {
        return {
          accounts_count: tasks.length,
        };
      })
      .catch(() => {
        throw new InternalServerErrorException();
      });
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
    const institution = await this.institutionsRepository.findByNordigenId(
      metadata.institution_id,
    );

    // Creates the app account
    let account = existingAccount?.account ?? new Account();
    if (account.id == null) {
      account.user_id = user_id;
      account.name = details.name ?? details.ownerName;
      account.currency = details.currency;
      account.balance = getBalanceAmountFrom(balances);
      account.institution = institution;
      account.type = getAccountTypeFrom(details.cashAccountType);
    } else {
      account.balance = getBalanceAmountFrom(balances);
    }

    this.logger.debug(`Creating or updating new account`);
    account = await this.accountRepository.save(account);

    // Creates the nordigen account
    const nordigenAccount = existingAccount ?? new NordigenAccount();
    nordigenAccount.id = nordigen_accountId;
    nordigenAccount.account = account;
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

    // Trigger event to start syncing the account
    this.eventEmitter.emit(
      ACCOUNT_ADDED,
      new AccountCreatedEvent({
        id: account.id,
      }),
    );

    return {
      account: account,
      open_banking_account: nordigenAccount,
    };
  }
}
