import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Account } from './entities/account.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAccountRequest } from './dto/create-account-request.dto';
import { AccountType } from './entities/accountType.model';
import { UpdateAccountRequest } from './dto/update-account-request.dto';
import { AccountSource } from './entities/accountSource.model';
import { Transaction } from '../transactions/entities/transaction.entity';

@Injectable()
export class AccountsService {
  private readonly logger = new Logger(AccountsService.name);

  constructor(
    @InjectRepository(Account)
    private readonly repository: Repository<Account>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  async findAllUserAccounts(userId: string): Promise<Account[]> {
    this.logger.debug(`Getting accounts for user ${userId}`);
    return await this.repository.find({
      where: { user_id: userId },
      relations: {
        institution: true,
      },
    });
  }

  async getUserAccount(userId: string, accountId: string): Promise<Account> {
    const account = await this.repository.findOne({
      where: {
        id: accountId,
        user_id: userId,
      },
      relations: {
        institution: true,
      },
    });

    if (account == null) {
      throw new NotFoundException();
    }

    return account;
  }

  async create(args: {
    user_id: string;
    dto: CreateAccountRequest;
  }): Promise<Account> {
    const { user_id, dto } = args;

    let normalizedInitialBalance = dto.initial_balance ?? 0;

    // Depending on the account type, the balance would be negative or positive
    if (dto.initial_balance) {
      switch (dto.type as AccountType) {
        case AccountType.CREDIT_CARD:
        case AccountType.LOAN:
        case AccountType.MORTGAGE:
          // If balance is positive, flip the sign
          // because credit cards and loans are negative balances
          // (you owe money)
          normalizedInitialBalance = -Math.abs(dto.initial_balance);
          break;
        default:
          // NO-OP
          break;
      }
    }

    const savedAccount = await this.repository.save({
      user_id: user_id,
      name: dto.name,
      balance: normalizedInitialBalance,
      currency: dto.currency ?? 'GBP',
      type: (dto.type as AccountType) ?? AccountType.UNKNOWN,
      source: (dto.source as AccountSource) ?? AccountSource.UNKNOWN,
      source_name: dto.source_name,
    });

    const shouldCreateInitialBalanceTransaction =
      !!dto.create_balance_transaction && normalizedInitialBalance !== 0;
    if (shouldCreateInitialBalanceTransaction) {
      this.logger.debug(
        `Creating initial balance transaction for account ${savedAccount.id}`,
      );

      await this.transactionRepository.save({
        accountId: savedAccount.id,
        amount: normalizedInitialBalance,
        currency: savedAccount.currency,
        date: new Date(),
        description: 'Initial balance',
        notes: 'Created during account creation',
      });
    }

    return savedAccount;
  }

  async update(args: {
    accountId: string;
    dto: UpdateAccountRequest;
    userId: string;
  }): Promise<Account> {
    const { accountId, dto, userId } = args;

    const dbEntity = await this.repository.findOne({
      where: {
        id: accountId,
        user_id: userId,
      },
    });

    if (!dbEntity) {
      throw new NotFoundException();
    }

    if (dto.balance && dto.create_balance_transaction) {
      // Create a new transaction if the balance is being updated
      this.logger.debug(
        `Creating balance transaction for account ${accountId} due to balance update`,
      );

      const balanceDifference = dbEntity.balance - dto.balance;
      if (balanceDifference !== 0) {
        this.logger.verbose(
          `Balance difference is ${balanceDifference}, creating transaction`,
        );

        const diffTransactions = await this.transactionRepository.save({
          accountId: accountId,
          amount: balanceDifference,
          currency: dbEntity.currency,
          date: new Date(),
          description: 'Manual balance adjustment',
          notes: 'Created due to manual account balance update',
        });
        this.logger.debug(
          `Created balance adjustment transaction ${diffTransactions.id} for account ${accountId}`,
        );
      }
    }

    const updatedAccount = await this.repository.save({
      balance: dto.balance ?? dbEntity.balance,
      id: accountId,
      user_id: userId,
      name: dto.name ?? dbEntity.name,
      currency: dto.currency ?? dbEntity.currency,
      type: (dto.type as AccountType) ?? dbEntity.type,
    });
    return updatedAccount;
  }

  async findOneById(id: string): Promise<Account> {
    const entity = await this.repository.findOne({
      where: {
        id: id,
      },
      relations: {
        institution: true,
      },
    });

    if (!entity) {
      throw new NotFoundException();
    }
    return entity;
  }

  async findAll(): Promise<Account[]> {
    return this.repository.find({
      relations: {
        institution: true,
      },
    });
  }

  async removeUserAccount(args: {
    user_id: string;
    account_id: string;
  }): Promise<Account> {
    const account = await this.repository.findOne({
      where: {
        id: args.account_id,
        user_id: args.user_id,
      },
    });

    if (account) {
      const result = await this.repository.remove(account);
      return result;
    }

    throw new NotFoundException();
  }

  async remove(id: string): Promise<Account> {
    const account = await this.repository.findOne({ where: { id: id } });
    if (account) {
      const result = await this.repository.remove(account);
      return result;
    }

    throw new NotFoundException();
  }
}
