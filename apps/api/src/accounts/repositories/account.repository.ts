import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { Account, AccountType } from '../entities/account.entity';

@Injectable()
export class AccountRepository {
  private readonly logger = new Logger(AccountRepository.name);

  constructor(
    @InjectRepository(Account)
    private repository: Repository<Account>,
  ) {}

  findByUserId(userId: string): Promise<Account[]> {
    return this.repository.find({
      where: { user_id: userId },
      relations: {
        nordigenAccount: true,
        institution: true,
      },
    });
  }

  async find(accountId: string) {
    return this.repository.findOne({
      relations: { nordigenAccount: true },
      where: {
        id: accountId,
      },
    });
  }

  async save(entity: Account): Promise<Account> {
    return await this.repository.save(entity);
  }

  async create(
    user_id: string,
    name: string,
    account_type: AccountType,
    balance: number,
    currency_code: string,
  ): Promise<Account> {
    const entity = new Account();
    entity.user_id = user_id;
    entity.name = name;
    entity.type = account_type;
    entity.balance = balance;
    entity.currency = currency_code;

    return await this.save(entity);
  }

  async findAllConnectedAccounts() {
    return await this.repository.find({
      relations: {
        nordigenAccount: true,
      },
    });
  }
}
