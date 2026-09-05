import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { NordigenRequisitionDto } from '../../features/nordigen/dto/nordigen-requisition.dto.js';
import { ObConnection } from './entities/connection.entity.js';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { NordigenService } from '../../features/nordigen/nordigen.service.js';
import { NordigenAccount } from './entities/nordigen-account.entity.js';
import { Account } from '../../features/accounts/entities/account.entity.js';
import { getBalanceAmountFrom } from '../../features/nordigen/dto/nordigen-balances.helper.js';
import { getAccountTypeFrom } from '../../features/nordigen/dto/ExternalCashAccountType1Code.helper.js';
import { Institution } from '../../features/institutions/entities/institution.entity.js';
import { Transaction } from '../../features/transactions/entities/transaction.entity.js';
import { supportedCountries } from './sync.service.js';
import { OpenBankingCountryDto } from './dto/openbanking-response.dto.js';

@Injectable()
export class OpenbankingService {
  private readonly logger = new Logger(OpenbankingService.name);

  constructor(
    @InjectRepository(ObConnection)
    private readonly repository: Repository<ObConnection>,
    @InjectRepository(NordigenAccount)
    private readonly nordigenAccountsRepository: Repository<NordigenAccount>,
    private readonly nordigenService: NordigenService,
    // private nordigenAccountsRepository: NordigenAccountRepository,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    @InjectRepository(Institution)
    private readonly institutionRepository: Repository<Institution>,
    @InjectRepository(Transaction)
    private readonly transactionsRepository: Repository<Transaction>,
  ) {}

  getAvailableCountries(locale: string): OpenBankingCountryDto[] {
    return supportedCountries.map((code) => {
      const regionNames = new Intl.DisplayNames([locale], {
        type: 'region',
      });

      return {
        code: code,
        name: regionNames.of(code) ?? code,
      };
    });
  }

  async getConnection(userId: string, connectionId: string) {
    const connection = await this.repository.findOne({
      where: {
        user_id: userId,
        id: connectionId,
      },
    });

    if (connection === null) {
      throw new NotFoundException('Open Banking connection not found');
    }

    return connection;
  }

  async deleteConnection(args: { user_id: string; connection_id: string }) {
    const { user_id, connection_id } = args;
    const connection = await this.getConnection(user_id, connection_id);

    // TODO: Delete the OB accounts from the DB
    const accountsToDelete = connection.accounts;
    const deletedAccounts: string[] = [];
    for (const accountId of accountsToDelete) {
      await this.nordigenAccountsRepository.delete({
        id: accountId,
      });
      deletedAccounts.push(accountId);
    }

    await this.repository.remove(connection);

    return {
      connection_id,
      accounts: deletedAccounts,
    };
  }

  async saveRequisition(user_id: string, dto: NordigenRequisitionDto) {
    const existing = await this.repository.findOne({
      where: { id: dto.id },
    });
    if (existing !== null && existing.user_id !== user_id) {
      throw new NotFoundException('Open Banking connection not found');
    }

    const connection = existing ?? new ObConnection();
    this.applyRequisition(connection, dto);
    connection.user_id = user_id;
    await this.repository.save(connection);
  }

  async updateRequisition(userId: string, dto: NordigenRequisitionDto) {
    const connection = await this.getConnection(userId, dto.id);
    this.applyRequisition(connection, dto);
    await this.repository.save(connection);
  }

  private applyRequisition(
    connection: ObConnection,
    dto: NordigenRequisitionDto,
  ): void {
    connection.id = dto.id;
    connection.created = dto.created;
    connection.redirect = dto.redirect;
    connection.status = dto.status;
    connection.institution_id = dto.institution_id;
    connection.agreement = dto.agreement;
    connection.reference = dto.reference;
    connection.accounts = dto.accounts;
    connection.user_language = dto.user_language;
    connection.link = dto.link;
    connection.ssn = dto.ssn;
    connection.account_selection = dto.account_selection;
    connection.redirect_immediate = dto.redirect_immediate;
  }

  async getConnections(user_id: string) {
    return await this.repository.find({
      where: {
        user_id: user_id,
      },
    });
  }

  async connectToAccounts(userId: string, accountIds: string[]) {
    await this.assertAccountsBelongToUser(userId, accountIds);

    for (const accountId of accountIds) {
      this.logger.log(`Syncing nordigen account: ${accountId}`);
      await this.connectToAccount(userId, accountId);
      this.logger.log(`Nordigen account synced: ${accountId}`);
    }

    return {
      accounts_count: accountIds.length,
    };
  }

  private async assertAccountsBelongToUser(
    userId: string,
    accountIds: string[],
  ): Promise<void> {
    const connections = await this.repository.find({
      where: { user_id: userId },
    });
    const ownedAccountIds = new Set(
      connections.flatMap((connection) => connection.accounts),
    );
    if (accountIds.some((accountId) => !ownedAccountIds.has(accountId))) {
      throw new NotFoundException('Open Banking account not found');
    }
  }

  // Should this method just deal with the "Nordigen Accounts" and
  // leave the app accounts alone?
  async connectToAccount(user_id: string, nordigen_accountId: string) {
    const existingNordigenAccount =
      await this.nordigenAccountsRepository.findOne({
        where: {
          resource_id: nordigen_accountId,
        },
      });

    let existingLinkedAccount: Account | null = null;
    if (existingNordigenAccount?.linked_account_id) {
      existingLinkedAccount = await this.accountRepository.findOne({
        where: {
          id: existingNordigenAccount.linked_account_id,
          user_id,
        },
      });
      if (existingLinkedAccount === null) {
        throw new NotFoundException('Open Banking account not found');
      }
    }

    // Get nordigen account metadata
    // this.logger.debug(`Getting Account Metadata: ${nordigen_accountId}`);
    const metadata =
      await this.nordigenService.getAccountMetadata(nordigen_accountId);
    // this.logger.debug(`Getting Account balances: ${nordigen_accountId}`);
    const balances =
      await this.nordigenService.getAccountBalance(nordigen_accountId);
    // this.logger.debug(`Getting Account details: ${nordigen_accountId}`);
    const details =
      await this.nordigenService.getAccountDetails(nordigen_accountId);

    this.logger.debug(
      `Existing Nordigen Account: ${existingNordigenAccount?.id}`,
    );
    // If the nordigen account is null (is new) then create a new account first
    let account = new Account();
    account.user_id = user_id;
    account.id = nordigen_accountId;

    if (existingLinkedAccount !== null) {
      account = existingLinkedAccount;
    }

    if (
      existingNordigenAccount === null ||
      existingNordigenAccount.linked_account_id === null ||
      existingNordigenAccount.linked_account_id === undefined
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
    nordigenAccount.linked_account_id =
      existingNordigenAccount?.linked_account_id ?? account.id;
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

  /**
   * @deprecated The method should not be used as is no longer maintained. Use 'SyncService.syncNordigenAccount()' instead.
   */
  async syncAccountTransactions(userId: string, accountId: string) {
    this.logger.log(`Syncing Nordigen account ${accountId}`);
    const nordigenAccount = await this.nordigenAccountsRepository.findOne({
      where: {
        id: accountId,
      },
    });

    if (nordigenAccount === null) {
      this.logger.error(`Nordigen Account with id '${accountId}' not found`);
      throw new NotFoundException(`Account not found`);
    }

    const { linked_account_id } = nordigenAccount;
    if (!linked_account_id) {
      this.logger.error(
        `Nordigen Account with id '${accountId}' doesn't have a linked account`,
      );
      throw new BadRequestException(`Invalid account state`);
    }

    const gualletAccount = await this.accountRepository.findOne({
      where: {
        id: linked_account_id,
        user_id: userId,
      },
    });

    if (gualletAccount === null) {
      this.logger.error(`Account with id '${accountId}' not found`);
      throw new NotFoundException(`Account mismatch: not found`);
    }

    try {
      // Sync Account Details and metadata
      const metadata = await this.nordigenService.getAccountMetadata(
        nordigenAccount.id,
      );
      nordigenAccount.status = metadata.status;

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
        Transaction.fromNordigenDto(linked_account_id, t),
      );
      await this.transactionsRepository.upsert(data, {
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

  async getLinkedAccount({
    userId,
    accountId,
  }: {
    userId: string;
    accountId: string;
  }): Promise<NordigenAccount> {
    const account = await this.accountRepository.findOne({
      where: { id: accountId, user_id: userId },
    });
    if (account === null) {
      throw new NotFoundException('Account not found');
    }

    const nordigenAccount = await this.nordigenAccountsRepository.findOne({
      where: {
        linked_account_id: accountId,
      },
    });

    if (nordigenAccount === null) {
      throw new NotFoundException(`No linked open banking account found`);
    }

    return nordigenAccount;
  }

  async getLinkedAccounts(userId: string): Promise<NordigenAccount[]> {
    const accounts = await this.accountRepository.find({
      where: { user_id: userId },
    });
    if (accounts.length === 0) {
      return [];
    }

    return this.nordigenAccountsRepository.find({
      where: { linked_account_id: In(accounts.map((account) => account.id)) },
    });
  }

  async getAccountMetadata(userId: string, accountId: string) {
    const nordigenAccount = await this.nordigenAccountsRepository.findOne({
      where: { id: accountId },
    });
    if (!nordigenAccount?.linked_account_id) {
      throw new NotFoundException('Open Banking account not found');
    }

    const account = await this.accountRepository.findOne({
      where: { id: nordigenAccount.linked_account_id, user_id: userId },
    });
    if (account === null) {
      throw new NotFoundException('Open Banking account not found');
    }

    return this.nordigenService.getAccountMetadata(accountId);
  }
}
