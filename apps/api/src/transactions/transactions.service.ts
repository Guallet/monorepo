import { Injectable, Logger } from '@nestjs/common';
import { Transaction } from './entities/transaction.entity';
import { TransactionRepository } from './transaction.repository';

@Injectable()
export class TransactionsService {
  private readonly logger = new Logger(TransactionsService.name);

  constructor(private transactionRepository: TransactionRepository) {}

  async getUserTransactions(
    userId: string,
    page: number,
    pageSize: number,
  ): Promise<Transaction[]> {
    this.logger.debug(
      `Getting user transactions: Page: ${page}, Size: ${pageSize}`,
    );
    return await this.transactionRepository.findAllByUserId(
      userId,
      page,
      pageSize,
    );
  }

  async getAccountTransactions(
    accountId: string,
    page: number,
    pageSize: number,
  ): Promise<Transaction[]> {
    return await this.transactionRepository.findAccountTransactions(
      accountId,
      page,
      pageSize,
    );
  }
}
