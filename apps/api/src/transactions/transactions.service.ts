import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Transaction } from './models/transaction.entity';

@Injectable()
export class TransactionsService {
  private readonly logger = new Logger(TransactionsService.name);

  constructor(
    @InjectRepository(Transaction)
    private repository: Repository<Transaction>,
  ) {}

  // get total transactions count for a user
  async getUserTransactionsCount(userId: string): Promise<number> {
    return this.repository.count({
      where: {
        account: { user_id: userId },
      },
    });
  }

  async getUserTransactionsInbox(args: {
    userId: string;
  }): Promise<Transaction[]> {
    return await this.repository.find({
      relations: { account: true, category: true },
      where: {
        account: { user_id: args.userId },
        category: {
          id: IsNull(),
        },
      },
      order: {
        date: 'DESC',
      },
    });
  }

  async getUserTransactions(args: {
    userId: string;
    page: number;
    pageSize: number;
  }): Promise<Transaction[]> {
    const { userId, page, pageSize } = args;

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
      },
      order: {
        date: 'DESC',
      },
      take: pageSize,
      skip: offset,
    });
  }

  async create(dto: CreateTransactionDto): Promise<Transaction> {
    const entity = {
      accountId: dto.accountId,
      description: dto.description,
      notes: dto.notes,
      amount: dto.amount,
      currency: dto.currency,
      date: dto.date,
      categoryId: dto.categoryId,
    };
    return this.repository.save(entity);
  }

  async findAll(): Promise<Transaction[]> {
    return [];
  }

  findOne(id: string) {
    return `This action returns a #${id} transaction`;
  }

  update(id: string, updateTransactionDto: UpdateTransactionDto) {
    return `This action updates a #${id} transaction`;
  }

  remove(id: string) {
    return `This action removes a #${id} transaction`;
  }

  async updateUserTransaction(args: {
    user_id: string;
    transaction_id: string;
    dto: UpdateTransactionDto;
  }): Promise<Transaction> {
    const { user_id, transaction_id, dto } = args;
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
}
