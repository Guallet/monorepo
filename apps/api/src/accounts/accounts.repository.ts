import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from './models/account.model';

@Injectable()
export class AccountsRepository {
  private readonly logger = new Logger(AccountsRepository.name);

  constructor(
    @InjectRepository(Account)
    private repository: Repository<Account>,
  ) {}

  async findAll() {
    return this.repository.find({
      relations: {
        institution: true,
      },
    });
  }

  async findById(id: string) {
    return this.repository.findOne({
      where: {
        id: id,
      },
    });
  }
}
