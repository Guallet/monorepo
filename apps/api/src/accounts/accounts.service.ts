import { Injectable } from '@nestjs/common';
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

  async remove(id: string): Promise<boolean> {
    return true;
  }
}
