import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './models/transaction.entity';

@Injectable()
export class TransactionsService {
  private readonly logger = new Logger(TransactionsService.name);

  constructor(
    @InjectRepository(Transaction)
    private repository: Repository<Transaction>,
  ) {}

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
}
