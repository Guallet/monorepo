import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Budget } from './entities/budget.entity';
import { Between, In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction } from '../transactions/entities/transaction.entity';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';

@Injectable()
export class BudgetsService {
  private readonly logger = new Logger(BudgetsService.name);

  constructor(
    @InjectRepository(Budget)
    private readonly repository: Repository<Budget>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  async findAllForUser(user_id: string) {
    return await this.repository.find({
      relations: {
        categories: true,
      },
      where: { user_id },
    });
  }

  async findOneForUser({ userId, id }: { userId: string; id: string }) {
    const budget = await this.repository.findOne({
      relations: {
        categories: true,
      },
      where: { id: id, user_id: userId },
    });
    if (!budget) {
      throw new NotFoundException();
    }
    return budget;
  }

  async getBudgetTransactions({
    userId,
    budgetId,
    dateRange,
  }: {
    userId: string;
    budgetId: string;
    dateRange: { month: number; year: number };
  }): Promise<Transaction[]> {
    this.logger.debug(
      `Getting transactions for budget ${budgetId} with date range ${JSON.stringify(dateRange)}`,
    );

    const budget = await this.repository.findOne({
      relations: {
        categories: true,
      },
      where: { id: budgetId, user_id: userId },
    });

    if (!budget) {
      throw new NotFoundException();
    }

    if (budget.categories.length === 0) {
      throw new InternalServerErrorException('Budget has no categories');
    }

    // Calculate the date range for the transactions. Remember, only monthly budgets are supported
    const from = new Date(dateRange.year, dateRange.month, 1);
    const to = new Date(dateRange.year, dateRange.month + 1, 0); // Last day of the month

    const transactions = await this.transactionRepository.find({
      relations: {
        account: true,
        category: true,
      },
      where: {
        account: { user_id: userId },
        categoryId: In(budget.categories.map((category) => category.id)),
        created_at: Between(from, to),
      },
    });

    this.logger.debug(
      `Found ${transactions.length} transactions for budget ${budgetId} in date range ${from.toISOString()} to ${to.toISOString()}`,
    );
    return transactions;
  }

  async getMonthlySpending({
    userId,
    budgetId,
    dateRange,
  }: {
    userId: string;
    budgetId: string;
    dateRange: { month: number; year: number };
  }): Promise<number> {
    const transactions = await this.getBudgetTransactions({
      userId,
      budgetId,
      dateRange,
    });

    return transactions.reduce(
      (acc, transaction) => acc + transaction.amount,
      0,
    );
  }

  async createBudgetForUser({
    userId,
    createBudgetDto,
  }: {
    userId: string;
    createBudgetDto: CreateBudgetDto;
  }): Promise<Budget> {
    if (createBudgetDto.categories.length === 0) {
      throw new BadRequestException('Categories cannot be empty');
    }

    const budget = this.repository.create({
      ...createBudgetDto,
      user_id: userId,
      categories: createBudgetDto.categories?.map((id) => ({ id })),
    });
    return await this.repository.save(budget);
  }

  async updateBudgetForUser({
    userId,
    budgetId,
    updateBudgetDto,
  }: {
    userId: string;
    budgetId: string;
    updateBudgetDto: UpdateBudgetDto;
  }): Promise<Budget> {
    const existingBudget = await this.repository.findOne({
      where: { id: budgetId, user_id: userId },
    });

    if (!existingBudget) {
      throw new NotFoundException();
    }

    return await this.repository.save({
      name: updateBudgetDto.name ?? existingBudget.name,
      amount: updateBudgetDto.amount ?? existingBudget.amount,
      currency: updateBudgetDto.currency ?? existingBudget.currency,
      colour: updateBudgetDto.colour ?? existingBudget.colour,
      icon: updateBudgetDto.icon ?? existingBudget.icon,
      ...(updateBudgetDto.categories &&
        updateBudgetDto.categories.length > 0 && {
          categories: updateBudgetDto.categories.map((id) => ({ id })),
        }),
    });
  }

  async deleteBudgetForUser({
    userId,
    budgetId,
  }: {
    userId: string;
    budgetId: string;
  }): Promise<Budget> {
    const budget = await this.repository.findOne({
      relations: {
        categories: true,
      },
      where: { id: budgetId, user_id: userId },
    });

    if (!budget) {
      throw new NotFoundException();
    }

    return await this.repository.remove(budget);
  }
}
