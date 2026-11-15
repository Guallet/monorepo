import { InvalidCurrencyError, Money } from '@guallet/money/server';
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
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

    return this.repository.manager.transaction(async (manager) => {
      const accounts = manager.getRepository(Account);
      const transactions = manager.getRepository(Transaction);
      let normalizedInitialBalance = dto.initial_balance ?? 0;

      // Depending on the account type, the balance would be negative or positive
      if (dto.initial_balance) {
        switch (dto.type) {
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

      const savedAccount = await accounts.save({
        user_id: user_id,
        name: dto.name,
        balance: normalizedInitialBalance,
        currency: dto.currency ?? 'GBP',
        type: dto.type ?? AccountType.UNKNOWN,
        source: (dto.source as AccountSource) ?? AccountSource.UNKNOWN,
        source_name: dto.source_name,
        institutionId: dto.institution_id ?? null,
        properties: dto.properties ?? null,
      });

      const shouldCreateInitialBalanceTransaction =
        !!dto.create_balance_transaction && normalizedInitialBalance !== 0;
      if (shouldCreateInitialBalanceTransaction) {
        this.logger.debug(
          `Creating initial balance transaction for account ${savedAccount.id}`,
        );

        await transactions.save({
          accountId: savedAccount.id,
          amount: normalizedInitialBalance,
          currency: savedAccount.currency,
          date: new Date(),
          description: 'Initial balance',
          notes: 'Created during account creation',
        });
      }

      return savedAccount;
    });
  }

  async update(args: {
    accountId: string;
    dto: UpdateAccountRequest;
    userId: string;
  }): Promise<Account> {
    const { accountId, dto, userId } = args;

    return this.repository.manager.transaction(async (manager) => {
      const accounts = manager.getRepository(Account);
      const transactions = manager.getRepository(Transaction);
      const existing = await accounts.findOne({
        where: { id: accountId, user_id: userId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!existing) throw new NotFoundException();

      if (typeof dto.balance === 'number' && dto.create_balance_transaction) {
        let difference: Money;
        try {
          difference = Money.fromCurrencyCode({
            amount: dto.balance,
            currencyCode: existing.currency,
          })
            .subtract(
              Money.fromCurrencyCode({
                amount: existing.balance,
                currencyCode: existing.currency,
              }),
            )
            .round();
        } catch (error) {
          if (error instanceof InvalidCurrencyError) {
            throw new BadRequestException(
              'Use a supported currency for a recorded balance adjustment.',
            );
          }
          throw error;
        }
        if (difference.amount !== 0) {
          if (dto.currency && dto.currency !== existing.currency) {
            throw new BadRequestException(
              'Disable the balance adjustment when changing currency.',
            );
          }
          await transactions.save({
            accountId,
            amount: difference.amount,
            currency: existing.currency,
            date: new Date(),
            description: 'Manual balance adjustment',
            notes: 'Created due to manual account balance update',
          });
        }
      }
      return accounts.save({
        balance: dto.balance ?? existing.balance,
        id: accountId,
        user_id: userId,
        name: dto.name ?? existing.name,
        currency: dto.currency ?? existing.currency,
        type: dto.type ?? existing.type,
      });
    });
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
