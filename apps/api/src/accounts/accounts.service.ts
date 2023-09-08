import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Account } from './models/account.model';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAccountRequest } from './dto/create-account-request.dto';
import { AccountType } from './models/accountType.model';

@Injectable()
export class AccountsService {
  private readonly logger = new Logger(AccountsService.name);

  constructor(
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
  ) {}

  async findAllUserAccounts(userId: string): Promise<Account[]> {
    this.logger.debug(`Getting accounts for user ${userId}`);
    return await this.accountRepository.find({
      where: { user_id: userId },
      relations: {
        institution: true,
      },
    });
  }

  async getUserAccount(userId: string, accountId: string): Promise<Account> {
    const account = await this.accountRepository.findOne({
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
    return await this.accountRepository.save({
      user_id: args.user_id,
      name: args.dto.name,
      balance: args.dto.initial_balance ?? 0,
      currency: args.dto.currency ?? 'GBP',
      // institution: args.dto.institution_id ?? null,
      account_type: AccountType.CURRENT_ACCOUNT,
    });
  }

  async findOneById(id: string): Promise<Account> {
    return this.accountRepository.findOne({
      where: {
        id: id,
      },
      relations: {
        institution: true,
      },
    });
  }

  async findAll(): Promise<Account[]> {
    return this.accountRepository.find({
      relations: {
        institution: true,
      },
    });
  }

  async removeUserAccount(args: {
    user_id: string;
    account_id: string;
  }): Promise<Account> {
    const account = await this.accountRepository.findOne({
      where: {
        id: args.account_id,
        user_id: args.user_id,
      },
    });

    if (account) {
      const result = await this.accountRepository.remove(account);
      return result;
    }

    throw new NotFoundException();
  }

  async remove(id: string): Promise<Account> {
    const account = await this.accountRepository.findOne({ where: { id: id } });
    if (account) {
      const result = await this.accountRepository.remove(account);
      return result;
    }

    throw new NotFoundException();
  }
}
