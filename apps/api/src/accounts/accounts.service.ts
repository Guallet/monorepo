import { Injectable, NotFoundException } from '@nestjs/common';
import { Account } from './models/account.model';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private repository: Repository<Account>,
  ) {}

  async create(): Promise<Account> {
    return {} as any;
  }

  async findOneById(id: string): Promise<Account> {
    return this.repository.findOne({
      where: {
        id: id,
      },
      relations: {
        institution: true,
      },
    });
  }

  async findAll(): Promise<Account[]> {
    return this.repository.find({
      relations: {
        institution: true,
      },
    });
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
