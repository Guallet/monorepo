import {
  Controller,
  Get,
  Param,
  Logger,
  Query,
  Post,
  Body,
  Patch,
  HttpCode,
  Delete,
} from '@nestjs/common';
import { BudgetsService } from './budgets.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { RequestUser } from 'src/auth/request-user.decorator';
import { UserPrincipal } from 'src/auth/user-principal';
import { ApiTags } from '@nestjs/swagger';
import { BudgetDto } from './dto/budget.dto';
import { Transaction } from '../transactions/entities/transaction.entity';

@Controller('budgets')
@ApiTags('Budgets')
export class BudgetsController {
  private readonly logger = new Logger(BudgetsController.name);

  // Budgets only works on the assumptions of monthly budgets, so the dates only make sense to be
  // from months, not specific dates
  private readonly defaultMonth: number;
  private readonly defaultYear: number;

  constructor(private readonly budgetsService: BudgetsService) {
    // By default, the dates are just the current month
    const today = new Date();
    this.defaultMonth = today.getMonth();
    this.defaultYear = today.getFullYear();
  }

  @Get()
  async findAll(
    @RequestUser() user: UserPrincipal,
    @Query('month') month?: number,
    @Query('year') year?: number,
  ): Promise<BudgetDto[]> {
    const budgets = await this.budgetsService.findAllForUser(user.id);

    this.logger.debug(`Found ${budgets.length} budgets for user ${user.id}`);
    const result: BudgetDto[] = [];
    for (const budget of budgets) {
      const spent = await this.budgetsService.getMonthlySpending({
        userId: user.id,
        budgetId: budget.id,
        dateRange: {
          month: month ?? this.defaultMonth,
          year: year ?? this.defaultYear,
        },
      });
      result.push(BudgetDto.fromDomain(budget, spent));
    }
    return result;
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @RequestUser() user: UserPrincipal,
    @Query('month') month?: number,
    @Query('year') year?: number,
  ): Promise<BudgetDto> {
    const budget = await this.budgetsService.findOneForUser({
      id: id,
      userId: user.id,
    });
    const spent = await this.budgetsService.getMonthlySpending({
      userId: user.id,
      budgetId: id,
      dateRange: {
        month: month ?? this.defaultMonth,
        year: year ?? this.defaultYear,
      },
    });
    return BudgetDto.fromDomain(budget, spent);
  }

  @Get(':id/transactions')
  async getBudgetTransactions(
    @RequestUser() user: UserPrincipal,
    @Param('id') id: string,
    @Query('month') month?: number,
    @Query('year') year?: number,
  ): Promise<Transaction[]> {
    return await this.budgetsService.getBudgetTransactions({
      userId: user.id,
      budgetId: id,
      dateRange: {
        month: month ?? this.defaultMonth,
        year: year ?? this.defaultYear,
      },
    });
  }

  @Post()
  @HttpCode(201)
  async create(
    @Body() createBudgetDto: CreateBudgetDto,
    @RequestUser() user: UserPrincipal,
  ): Promise<BudgetDto> {
    const budget = await this.budgetsService.createBudgetForUser({
      userId: user.id,
      createBudgetDto,
    });
    const spent = await this.budgetsService.getMonthlySpending({
      userId: user.id,
      budgetId: budget.id,
      dateRange: {
        month: this.defaultMonth,
        year: this.defaultYear,
      },
    });
    return BudgetDto.fromDomain(budget, spent);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateBudgetDto: UpdateBudgetDto,
    @RequestUser() user: UserPrincipal,
  ): Promise<BudgetDto> {
    const budget = await this.budgetsService.updateBudgetForUser({
      userId: user.id,
      budgetId: id,
      updateBudgetDto,
    });
    const spent = await this.budgetsService.getMonthlySpending({
      userId: user.id,
      budgetId: budget.id,
      dateRange: {
        month: this.defaultMonth,
        year: this.defaultYear,
      },
    });
    return BudgetDto.fromDomain(budget, spent);
  }

  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @RequestUser() user: UserPrincipal,
  ): Promise<BudgetDto> {
    const budget = await this.budgetsService.deleteBudgetForUser({
      userId: user.id,
      budgetId: id,
    });
    // No need to get the final spent amount as this has been deleted
    return BudgetDto.fromDomain(budget, 0);
  }
}
