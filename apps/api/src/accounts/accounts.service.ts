import { Injectable } from '@nestjs/common';
import { Account } from './models/account.model';
import { AccountType } from './models/accountType.model';
import { Institution } from 'src/institutions/entities/institution.model';

@Injectable()
export class AccountsService {
  /**
   * MOCK
   * Put some real business logic here
   * Left for demonstration purposes
   */

  async create(): Promise<Account> {
    return {} as any;
  }

  async findOneById(id: string): Promise<Account> {
    return {} as any;
  }

  async findAll(): Promise<Account[]> {
    return [
      {
        id: '123',
        name: 'Account 1',
        description: 'description',
        balance: 123.12,
        type: AccountType.CURRENT_ACCOUNT,
        institution: { id: '1' },
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: new Date(),
      },
      {
        id: '234',
        name: 'Account 2',
        description: 'description',
        balance: 22.12,
        type: AccountType.SAVINGS,
        institution: { id: '3' },
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: new Date(),
      },
    ] as Account[];
  }

  async remove(id: string): Promise<boolean> {
    return true;
  }
}
