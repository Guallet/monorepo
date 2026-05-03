import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateRegularPaymentDto } from './dto/create-regular-payment.dto';
import { UpdateRegularPaymentDto } from './dto/update-regular-payment.dto';
import { RegularPayment } from './entities/regular-payment.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from '../categories/entities/category.entity';
import { Account } from '../accounts/entities/account.entity';

@Injectable()
export class RegularPaymentsService {
  private readonly logger = new Logger(RegularPaymentsService.name);

  constructor(
    @InjectRepository(RegularPayment)
    private readonly repository: Repository<RegularPayment>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
  ) {}

  async create({
    userId,
    createRegularPaymentDto,
  }: {
    userId: string;
    createRegularPaymentDto: CreateRegularPaymentDto;
  }) {
    // Verify the category is valid
    if (createRegularPaymentDto.categoryId) {
      const category = await this.categoryRepository.findOne({
        where: {
          user_id: userId,
          id: createRegularPaymentDto.categoryId,
        },
      });

      if (!category) {
        throw new BadRequestException(
          'Invalid Category ID: Category not found',
        );
      }
    }

    if (createRegularPaymentDto.accountId) {
      const account = await this.accountRepository.findOne({
        where: {
          user_id: userId,
          id: createRegularPaymentDto.accountId,
        },
      });

      if (!account) {
        throw new BadRequestException('Invalid Account ID: Account not found');
      }
    }

    const savedEntity = await this.repository.save({
      user_id: userId,
      amount: createRegularPaymentDto.amount,
      cadence: createRegularPaymentDto.cadence,
      currency: createRegularPaymentDto.currency,
      name: createRegularPaymentDto.name,
      type: createRegularPaymentDto.type,
      startDate: createRegularPaymentDto.startDate
        ? new Date(createRegularPaymentDto.startDate)
        : new Date(),
      imageUrl: createRegularPaymentDto.imageUrl,
      account: createRegularPaymentDto.accountId
        ? { id: createRegularPaymentDto.accountId }
        : undefined,
      category: createRegularPaymentDto.categoryId
        ? { id: createRegularPaymentDto.categoryId }
        : undefined,
    });

    return savedEntity;
  }

  async findUserRegularPayments(userId: string): Promise<RegularPayment[]> {
    this.logger.debug(`Getting regular payments for user ${userId}`);
    const payments: RegularPayment[] = await this.repository.find({
      where: { user_id: userId },
      relations: {
        category: true,
        account: true,
      },
    });
    return payments;
  }

  async findUserRegularPayment({
    userId,
    id,
  }: {
    userId: string;
    id: string;
  }): Promise<RegularPayment> {
    const payment = await this.repository.findOne({
      where: { user_id: userId, id },
      relations: {
        category: true,
        account: true,
      },
    });

    if (!payment) {
      this.logger.warn(
        `Regular payment with id ${id} for user ${userId} not found`,
      );
      throw new NotFoundException('Regular payment not found');
    }

    return payment;
  }

  async update({
    id,
    userId,
    dto,
  }: {
    id: string;
    userId: string;
    dto: UpdateRegularPaymentDto;
  }): Promise<RegularPayment> {
    this.logger.debug(`Updating regular payment ${id} for user ${userId}`, dto);

    const entity = await this.repository.findOne({
      where: { user_id: userId, id: id.toString() },
    });

    if (!entity) {
      this.logger.warn(
        `Regular payment with id ${id} for user ${userId} not found`,
      );
      throw new NotFoundException('Regular payment not found');
    }

    if (dto.categoryId && dto.categoryId !== entity.categoryId) {
      // Verify the category is valid
      this.logger.debug(
        `Verifying category ${dto.categoryId} for user ${userId} to update regular payment ${id}`,
      );
      const category = await this.categoryRepository.findOne({
        where: {
          user_id: userId,
          id: dto.categoryId,
        },
      });

      if (!category) {
        throw new BadRequestException(
          'Invalid Category ID: Category not found',
        );
      }
    }

    if (dto.accountId && dto.accountId !== entity.accountId) {
      this.logger.debug(
        `Verifying account ${dto.accountId} for user ${userId} to update regular payment ${id}`,
      );
      const account = await this.accountRepository.findOne({
        where: {
          user_id: userId,
          id: dto.accountId,
        },
      });

      if (!account) {
        throw new BadRequestException('Invalid Account ID: Account not found');
      }
    }

    const updatedEntity = await this.repository.save({
      ...entity,
      name: dto.name ?? entity.name,
      amount: Number(dto.amount ?? entity.amount),
      currency: dto.currency ?? entity.currency,
      cadence: dto.cadence ?? entity.cadence,
      type: dto.type ?? entity.type,
      startDate: dto.startDate ? new Date(dto.startDate) : entity.startDate,
      imageUrl: dto.imageUrl ?? entity.imageUrl,
      accountId: dto.accountId ?? entity.accountId,
      categoryId: dto.categoryId ?? entity.categoryId,
    });

    return updatedEntity;
  }

  async remove({
    userId,
    id,
  }: {
    userId: string;
    id: string;
  }): Promise<RegularPayment> {
    const payment = await this.findUserRegularPayment({ userId, id });

    if (!payment) {
      this.logger.warn(
        `Regular payment with id ${id} for user ${userId} not found`,
      );
      throw new NotFoundException('Regular payment not found');
    }

    return await this.repository.remove(payment);
  }
}
