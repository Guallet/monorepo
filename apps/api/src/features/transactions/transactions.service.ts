import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, In, IsNull, Repository } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { InboxTransaction } from './entities/inbox-transaction.model';
import { AccountsService } from '../accounts/accounts.service';

@Injectable()
export class TransactionsService {
  private readonly logger = new Logger(TransactionsService.name);

  constructor(
    @InjectRepository(Transaction)
    private readonly repository: Repository<Transaction>,
    private readonly accountService: AccountsService,
  ) {}

  // get total transactions count for a user, with query filters
  async getUserTransactionsCount({
    userId,
    filters: { accounts, categories, startDate, endDate },
  }: {
    userId: string;
    filters: {
      accounts?: string[];
      categories?: string[];
      startDate?: Date;
      endDate?: Date;
    };
  }): Promise<number> {
    if (accounts?.length === 0) {
      throw new BadRequestException('Accounts cannot be empty');
    }

    return await this.repository.count({
      where: {
        account: { user_id: userId },
        ...(accounts && { accountId: In(accounts) }),
        ...(categories && { categoryId: In(categories) }),
        ...(startDate && endDate && { date: Between(startDate, endDate) }),
      },
    });
  }

  async getUserTransactionsInbox({
    userId,
    page = 1,
    pageSize = 50,
  }: {
    userId: string;
    page?: number;
    pageSize?: number;
  }): Promise<InboxTransaction[]> {
    const offset = (page - 1) * pageSize;
    if (offset < 0) {
      throw new BadRequestException('Offset cannot be negative');
    }

    const transactions = await this.repository.find({
      relations: { account: true, category: true },
      where: {
        account: { user_id: userId },
        category: {
          id: IsNull(),
        },
      },
      order: {
        date: 'DESC',
      },
      take: pageSize,
      skip: offset,
    });

    // TODO: Apply the rules to the transactions and get the processed category
    return transactions.map((x) => {
      return {
        ...x,
        rule_id: undefined,
        processed_category_id: undefined,
      };
    });
  }

  async getUserTransactionsInboxCount({
    userId,
  }: {
    userId: string;
  }): Promise<number> {
    return await this.repository.count({
      where: {
        account: { user_id: userId },
        category: {
          id: IsNull(),
        },
      },
    });
  }

  async getUserTransactions({
    userId,
    page,
    pageSize,
    accounts,
    categories,
    startDate,
    endDate,
  }: {
    userId: string;
    page: number;
    pageSize: number;
    accounts?: string[];
    categories?: string[];
    startDate?: Date;
    endDate?: Date;
  }): Promise<Transaction[]> {
    this.logger.debug('Fetching user transactions with filters', {
      userId,
      page,
      pageSize,
      accounts,
      categories,
      startDate,
      endDate,
    });

    if (accounts?.length === 0) {
      throw new BadRequestException('Accounts cannot be empty');
    }

    const offset = (page - 1) * pageSize;
    if (offset < 0) {
      throw new BadRequestException('Offset cannot be negative');
    }

    return this.repository.find({
      relations: {
        account: true,
        category: true,
      },
      where: {
        account: { user_id: userId },
        ...(accounts && { accountId: In(accounts) }),
        ...(categories && { categoryId: In(categories) }),
        // ...(startDate && { date: MoreThanOrEqual(startDate) }),
        ...(startDate && endDate && { date: Between(startDate, endDate) }),
        // ...(endDate && { date: LessThanOrEqual(endDate) }),
        // date: MoreThanOrEqual(startDate), // LessThanOrEqual(endDate),
      },
      order: {
        date: 'DESC',
        // created_at: 'DESC',
      },
      take: pageSize,
      skip: offset,
    });
  }

  async create({
    userId,
    dto,
  }: {
    userId: string;
    dto: CreateTransactionDto;
  }): Promise<Transaction> {
    // Validate the user can access the account
    const account = await this.accountService.getUserAccount(
      userId,
      dto.accountId,
    );

    const entity = {
      accountId: dto.accountId,
      description: dto.description,
      notes: dto.notes,
      amount: dto.amount,
      // Get the current currency of the account in case the user doesn't provide one
      currency: dto.currency ?? account.currency,
      date: dto.date,
      categoryId: dto.categoryId,
    };
    return this.repository.save(entity);
  }

  async findOne(id: string): Promise<Transaction> {
    const entity = await this.repository.findOne({
      relations: { account: true, category: true },
      where: {
        id: id,
      },
    });

    if (!entity) {
      throw new NotFoundException('Transaction not found');
    }
    return entity;
  }

  async updateUserTransaction({
    user_id,
    transaction_id,
    dto,
  }: {
    user_id: string;
    transaction_id: string;
    dto: UpdateTransactionDto;
  }): Promise<Transaction> {
    const dbEntity = await this.repository.findOne({
      where: {
        id: transaction_id,
        account: { user_id: user_id },
      },
    });

    if (!dbEntity) {
      throw new NotFoundException();
    }

    const updatedEntity = {
      ...dbEntity,
      amount: dto.amount ?? dbEntity.amount,
      description: dto.description ?? dbEntity.description,
      notes: dto.notes ?? dbEntity.notes,
      currency: dto.currency ?? dbEntity.currency,
      date: dto.date ?? dbEntity.date,
      categoryId: dto.categoryId ?? dbEntity.categoryId,
    };
    return await this.repository.save(updatedEntity);
  }

  async getAccountTransactions({
    accountId,
    startDate,
    endDate,
  }: {
    accountId: string;
    startDate: Date;
    endDate: Date;
  }): Promise<Transaction[]> {
    const transactions = await this.repository.find({
      where: {
        accountId: accountId,
        date: Between(startDate, endDate),
      },
      order: {
        date: 'DESC',
      },
    });

    return transactions;
  }

  async deleteUserTransaction({
    user_id,
    transaction_id,
  }: {
    user_id: string;
    transaction_id: string;
  }): Promise<Transaction> {
    const dbEntity = await this.repository.findOne({
      where: {
        id: transaction_id,
        account: { user_id: user_id },
      },
    });

    if (!dbEntity) {
      throw new NotFoundException();
    }

    return await this.repository.remove(dbEntity);
  }

  /**
   * Get all user transactions for export without pagination.
   * Used for CSV export functionality.
   */
  async getAllUserTransactionsForExport({
    userId,
    accounts,
    startDate,
    endDate,
  }: {
    userId: string;
    accounts?: string[];
    startDate?: Date;
    endDate?: Date;
  }): Promise<Transaction[]> {
    this.logger.debug('Fetching all user transactions for export', {
      userId,
      accounts,
      startDate,
      endDate,
    });

    return this.repository.find({
      relations: {
        account: true,
        category: true,
      },
      where: {
        account: { user_id: userId },
        ...(accounts && accounts.length > 0 && { accountId: In(accounts) }),
        ...(startDate && endDate && { date: Between(startDate, endDate) }),
      },
      order: {
        date: 'DESC',
      },
    });
  }
}
