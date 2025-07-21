import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Account } from './entities/account.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAccountRequest } from './dto/create-account-request.dto';
import { AccountType } from './entities/accountType.model';
import { UpdateAccountRequest } from './dto/update-account-request.dto';
import { AccountSource } from './entities/accountSource.model';

@Injectable()
export class AccountsService {
  private readonly logger = new Logger(AccountsService.name);

  constructor(
    @InjectRepository(Account)
    private repository: Repository<Account>,
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

    // Depending on the account type, the balance would be negative or positive
    if (dto.initial_balance) {
      switch (dto.type as AccountType) {
        case AccountType.CREDIT_CARD:
        case AccountType.LOAN:
        case AccountType.MORTGAGE:
          // If balance is positive, flip the sign
          // because credit cards and loans are negative balances
          // (you owe money)
          dto.initial_balance = -Math.abs(dto.initial_balance);
          break;
        default:
          // NO-OP
          break;
      }
    }

    return await this.repository.save({
      user_id: user_id,
      name: dto.name,
      balance: dto.initial_balance ?? 0,
      currency: dto.currency ?? 'GBP',
      type: (dto.type as AccountType) ?? AccountType.UNKNOWN,
      source: (dto.source as AccountSource) ?? AccountSource.UNKNOWN,
      source_name: dto.source_name,
    });
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

    return await this.repository.save({
      balance: dto.balance ?? dbEntity.balance,
      id: accountId,
      user_id: userId,
      name: dto.name ?? dbEntity.name,
      currency: dto.currency ?? dbEntity.currency,
      type: (dto.type as AccountType) ?? dbEntity.type,
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
