import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { NordigenRequisitionDto } from 'src/nordigen/dto/nordigen-requisition.dto';
import { ObConnection } from './entities/connection.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { NordigenService } from 'src/nordigen/nordigen.service';
import { NordigenAccount } from './entities/nordigen-account.entity';
import { Account } from 'src/accounts/entities/account.entity';
import { getBalanceAmountFrom } from 'src/nordigen/dto/nordigen-balances.helper';
import { getAccountTypeFrom } from 'src/nordigen/dto/ExternalCashAccountType1Code.helper';
import { supportedCountries } from 'src/admin/admin.service';
import { Institution } from 'src/institutions/entities/institution.entity';
import { Transaction } from 'src/transactions/entities/transaction.entity';
import { NordigenTransactionDto } from 'src/nordigen/dto/nordigen-transaction.dto';

@Injectable()
export class OpenbankingService {
  private readonly logger = new Logger(OpenbankingService.name);

  constructor(
    @InjectRepository(ObConnection)
    private repository: Repository<ObConnection>,
    @InjectRepository(NordigenAccount)
    private nordigenAccountsRepository: Repository<NordigenAccount>,
    private nordigenService: NordigenService,
    // private nordigenAccountsRepository: NordigenAccountRepository,
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
    @InjectRepository(Institution)
    private institutionRepository: Repository<Institution>,
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
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
        this.logger.debug(`Syncing nordigen account: ${accountId}`);
        await this.connectToAccount(userId, accountId);
        this.logger.debug(`Nordigen account synced: ${accountId}`);
      }

      return {
        accounts_count: accountIds.length,
      };
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  // Should this method just deal with the "Nordigen Accounts" and
  // leave the app accounts alone?
  async connectToAccount(user_id: string, nordigen_accountId: string) {
    // Get nordigen account metadata
    // this.logger.debug(`Getting Account Metadata: ${nordigen_accountId}`);
    const metadata = await this.nordigenService.getAccountMetadata(
      nordigen_accountId,
    );
    // this.logger.debug(`Getting Account balances: ${nordigen_accountId}`);
    const balances = await this.nordigenService.getAccountBalance(
      nordigen_accountId,
    );
    // this.logger.debug(`Getting Account details: ${nordigen_accountId}`);
    const details = await this.nordigenService.getAccountDetails(
      nordigen_accountId,
    );

    // If there is an existing account linked to this nordigen account, don't create it again
    const existingNordigenAccount =
      await this.nordigenAccountsRepository.findOne({
        where: {
          id: nordigen_accountId,
        },
      });

    this.logger.debug(
      `Existing Nordigen Account: ${existingNordigenAccount?.id}`,
    );
    // If the nordigen account is null (is new) then create a new account first
    let account = new Account();
    account.user_id = user_id;
    account.id = nordigen_accountId;

    if (
      existingNordigenAccount === null ||
      existingNordigenAccount.accountId === null
    ) {
      // Creates the app account
      const tmpAccount = await this.accountRepository.findOne({
        where: {
          user_id: user_id,
          id: nordigen_accountId,
        },
      });
      if (tmpAccount !== null) {
        this.logger.debug(
          `Found existing app account ${tmpAccount.id} for nordigen id ${nordigen_accountId}`,
        );
        if (tmpAccount.id !== nordigen_accountId) {
          throw new InternalServerErrorException(`Account id mismatch`);
        }
        account = tmpAccount;
      } else {
        // this.logger.debug(`Creating new app account`);
        const appInstitution = await this.institutionRepository.findOne({
          where: {
            nordigen_id: metadata.institution_id,
          },
        });
        if (appInstitution === null) {
          throw new InternalServerErrorException(`Institution not found`);
          // TODO: Force a sync with the server to get the latest institutions
        }

        account.user_id = user_id;
        account.name =
          details.name ??
          details.details ??
          details.ownerName ??
          'Unknown Account';
        account.currency = details.currency;
        account.balance = getBalanceAmountFrom(balances);
        account.institutionId = appInstitution.id;
        account.type = getAccountTypeFrom(details.cashAccountType);
      }

      try {
        // this.logger.debug(`Saving app account`, JSON.stringify(account));
        account = await this.accountRepository.save(account);
      } catch (error) {
        this.logger.error(`Error saving app account`, error);
        throw error;
      }
    }

    // Creates or updates the nordigen account
    const nordigenAccount = existingNordigenAccount ?? new NordigenAccount();
    nordigenAccount.id = nordigen_accountId;
    nordigenAccount.accountId =
      existingNordigenAccount?.accountId ?? account.id;
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
    nordigenAccount.created = new Date();

    // this.logger.debug(`Saving Nordigen Account`);
    try {
      await this.nordigenAccountsRepository.save(nordigenAccount);
    } catch (error) {
      this.logger.error(`Error saving Nordigen Account`, error);
      throw error;
    }

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

  async syncAccountTransactions(accountId: string) {
    this.logger.debug(`Syncing Nordigen account ${accountId}`);
    const nordigenAccount = await this.nordigenAccountsRepository.findOne({
      where: {
        id: accountId,
      },
    });

    if (nordigenAccount === null) {
      this.logger.error(`Nordigen Account with id '${accountId}' not found`);
      throw new NotFoundException(`Account not found`);
    }

    const gualletAccount = await this.accountRepository.findOne({
      where: {
        // For now, the app assumes the Nordigen Account ID and the Guallet app account ID are the same
        id: nordigenAccount.accountId,
      },
    });

    if (gualletAccount === null) {
      this.logger.error(`Account with id '${accountId}' not found`);
      throw new NotFoundException(`Account mismatch: not found`);
    }

    try {
      // Sync the balances
      const balances = await this.nordigenService.getAccountBalance(
        nordigenAccount.id,
      );
      gualletAccount.balance = getBalanceAmountFrom(balances);
      await this.accountRepository.save(gualletAccount);

      // Sync the transactions
      // TODO: As we know the last sync date, should we only sync the transactions since then?
      const transactions = await this.nordigenService.getAccountTransactions(
        nordigenAccount.id,
      );

      // Convert from NordigenTransaction to Guallet Transaction
      const data = transactions.map((t) =>
        Transaction.fromNordigenDto(nordigenAccount.accountId, t),
      );
      const savedTransactions = await this.transactionsRepository.upsert(data, {
        conflictPaths: ['externalId'],
        skipUpdateIfNoValuesChanged: true,
      });

      // Update nordigen account
      nordigenAccount.last_refreshed = new Date();
      await this.nordigenAccountsRepository.save(nordigenAccount);
    } catch (error) {
      this.logger.error(`Error syncing account`, error);
      throw error;
    }
  }
}
