import { Injectable } from '@nestjs/common';
import { Account } from './models/account.model';
import { AccountType } from './models/accountType.model';
import { AccountsRepository } from './accounts.repository';

@Injectable()
export class AccountsService {
  constructor(private repository: AccountsRepository) {}

  async create(): Promise<Account> {
    return {} as any;
  }

  async findOneById(id: string): Promise<Account> {
    return this.repository.findById(id);
  }

  async findAll(): Promise<Account[]> {
    return this.repository.findAll();
  }

  async remove(id: string): Promise<boolean> {
    return true;
  }
}
