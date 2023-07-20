import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './entities/transaction.entity';

@Injectable()
export class TransactionRepository {
  private readonly logger = new Logger(TransactionRepository.name);

  constructor(
    @InjectRepository(Transaction)
    private repository: Repository<Transaction>,
  ) {}

  async findAllByUserId(
    userId: string,
    page: number,
    pageSize: number,
  ): Promise<Transaction[]> {
    const offset = (page - 1) * pageSize;
    if (offset < 0) {
      throw new Error('Offset cannot be negative');
    }

    return this.repository.find({
      relations: {
        account: true,
        category: true,
      },
      where: {
        account: { user_id: userId },
      },
      order: {
        date: 'DESC',
      },
      take: pageSize,
      skip: offset,
    });
  }

  async find(id: string) {
    return this.repository.findOne({
      relations: {
        account: true,
        category: true,
      },
      where: {
        id: id,
      },
    });
  }

  async saveAll(transactions: Transaction[]) {
    await this.repository.upsert(transactions, {
      conflictPaths: ['nordigen_id'],
    });
  }

  findAccountTransactions(
    accountId: string,
    page: number,
    pageSize: number,
  ): Transaction[] | PromiseLike<Transaction[]> {
    const offset = (page - 1) * pageSize;
    if (offset < 0) {
      throw new Error('Offset cannot be negative');
    }

    return this.repository.find({
      relations: {
        account: true,
        category: true,
      },
      where: {
        account: { id: accountId },
      },
      order: {
        date: 'DESC',
      },
      take: pageSize,
      skip: offset,
    });
  }
}
