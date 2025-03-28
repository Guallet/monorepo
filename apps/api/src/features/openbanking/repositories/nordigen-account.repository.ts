import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NordigenAccount } from '../entities/nordigen-account.entity';

@Injectable()
export class NordigenAccountRepository {
  constructor(
    @InjectRepository(NordigenAccount)
    private repository: Repository<NordigenAccount>,
  ) {}

  async find(nordigen_accountId: string) {
    return await this.repository.findOne({
      where: {
        id: nordigen_accountId,
      },
    });
  }

  async save(account: NordigenAccount): Promise<NordigenAccount> {
    return await this.repository.save(account);
  }

  async saveAll(accounts: NordigenAccount[]) {
    return await this.repository.upsert(accounts, {
      conflictPaths: ['id'],
      skipUpdateIfNoValuesChanged: true,
    });
  }

  async update(account: NordigenAccount) {
    await this.repository.upsert(account, {
      conflictPaths: ['id'],
      skipUpdateIfNoValuesChanged: true,
    });
  }

  async deleteAccountId(id: string) {
    await this.repository.delete({
      id: id,
    });

    return id;
  }

  async deleteAccount(account: NordigenAccount) {
    await this.repository.delete({
      id: account.id,
    });

    return account;
  }
}
