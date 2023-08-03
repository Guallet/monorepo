import { Injectable } from '@nestjs/common';
import { Account } from './models/account.model';

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
      },
    ] as Account[];
  }

  async remove(id: string): Promise<boolean> {
    return true;
  }
}
