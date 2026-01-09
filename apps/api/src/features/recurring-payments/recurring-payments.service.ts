import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RecurringPayment } from './entities/recurring-payment.entity';
import { CreateRecurringPaymentDto } from './dto/create-recurring-payment.dto';
import { UpdateRecurringPaymentDto } from './dto/update-recurring-payment.dto';
import { RecurrenceDetectorService } from './recurrence-detector.service';
import { TransactionsService } from '../transactions/transactions.service';
import { DetectedRecurringPaymentDto } from './dto/detected-recurring-payment.dto';

@Injectable()
export class RecurringPaymentsService {
  private readonly logger = new Logger(RecurringPaymentsService.name);

  constructor(
    @InjectRepository(RecurringPayment)
    private readonly repository: Repository<RecurringPayment>,
    private readonly recurrenceDetector: RecurrenceDetectorService,
    private readonly transactionsService: TransactionsService,
  ) {}

  async create(args: {
    userId: string;
    dto: CreateRecurringPaymentDto;
  }): Promise<RecurringPayment> {
    const { userId, dto } = args;

    const entity = this.repository.create({
      userId,
      type: dto.type,
      name: dto.name,
      amount: dto.amount,
      currency: dto.currency,
      cadence: dto.cadence,
      nextDate: dto.nextDate,
      imageUrl: dto.imageUrl,
      categoryId: dto.categoryId,
    });

    return await this.repository.save(entity);
  }

  async findAll(userId: string): Promise<RecurringPayment[]> {
    return await this.repository.find({
      where: { userId },
      relations: ['category'],
      order: { nextDate: 'ASC' },
    });
  }

  async findOne(args: { id: string; userId: string }): Promise<RecurringPayment> {
    const { id, userId } = args;

    const entity = await this.repository.findOne({
      where: { id, userId },
      relations: ['category'],
    });

    if (!entity) {
      throw new NotFoundException('Recurring payment not found');
    }

    return entity;
  }

  async update(args: {
    id: string;
    userId: string;
    dto: UpdateRecurringPaymentDto;
  }): Promise<RecurringPayment> {
    const { id, userId, dto } = args;

    const entity = await this.findOne({ id, userId });

    // Update fields
    if (dto.type !== undefined) entity.type = dto.type;
    if (dto.name !== undefined) entity.name = dto.name;
    if (dto.amount !== undefined) entity.amount = dto.amount;
    if (dto.currency !== undefined) entity.currency = dto.currency;
    if (dto.cadence !== undefined) entity.cadence = dto.cadence;
    if (dto.nextDate !== undefined) entity.nextDate = dto.nextDate;
    if (dto.imageUrl !== undefined) entity.imageUrl = dto.imageUrl;
    if (dto.categoryId !== undefined) entity.categoryId = dto.categoryId;

    return await this.repository.save(entity);
  }

  async remove(args: { id: string; userId: string }): Promise<RecurringPayment> {
    const { id, userId } = args;

    const entity = await this.findOne({ id, userId });
    return await this.repository.remove(entity);
  }

  async detectRecurringPayments(
    userId: string,
  ): Promise<DetectedRecurringPaymentDto[]> {
    // Get transactions from last 13 months
    const thirteenMonthsAgo = new Date();
    thirteenMonthsAgo.setMonth(thirteenMonthsAgo.getMonth() - 13);

    const transactions = await this.transactionsService.getUserTransactions({
      userId,
      page: 1,
      pageSize: 10000, // Get all transactions
      startDate: thirteenMonthsAgo,
      endDate: new Date(),
    });

    this.logger.log(
      `Analyzing ${transactions.length} transactions for recurring patterns`,
    );

    return await this.recurrenceDetector.detectRecurringPatterns(transactions);
  }

  async getSuggestedTransactions(
    userId: string,
  ): Promise<DetectedRecurringPaymentDto[]> {
    // This is an alias for detectRecurringPayments
    // Returns detected patterns that can be used to create recurring payments
    return await this.detectRecurringPayments(userId);
  }
}
