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
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { BudgetsService } from './budgets.service.js';
import { CreateBudgetDto } from './dto/create-budget.dto.js';
import { UpdateBudgetDto } from './dto/update-budget.dto.js';
import { RequestUser } from '../../auth/request-user.decorator.js';
import { UserPrincipal } from '../../auth/user-principal.js';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { BudgetDto } from './dto/budget.dto.js';
import { TransactionDto } from '../transactions/dto/transaction.dto.js';

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
  @ApiOperation({ summary: 'List the current user’s budgets' })
  @ApiQuery({ name: 'month', required: false, type: Number })
  @ApiQuery({ name: 'year', required: false, type: Number })
  @ApiResponse({ status: 200, type: [BudgetDto] })
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
  @ApiOperation({ summary: 'Get a budget by ID' })
  @ApiParam({ name: 'id', format: 'uuid', description: 'Budget ID' })
  @ApiQuery({ name: 'month', required: false, type: Number })
  @ApiQuery({ name: 'year', required: false, type: Number })
  @ApiResponse({ status: 200, type: BudgetDto })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
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
  @ApiOperation({ summary: 'List a budget’s transactions for a month' })
  @ApiParam({ name: 'id', format: 'uuid', description: 'Budget ID' })
  @ApiQuery({ name: 'month', required: false, type: Number })
  @ApiQuery({ name: 'year', required: false, type: Number })
  @ApiResponse({ status: 200, type: [TransactionDto] })
  async getBudgetTransactions(
    @RequestUser() user: UserPrincipal,
    @Param('id', ParseUUIDPipe) id: string,
    @Query('month') month?: number,
    @Query('year') year?: number,
  ): Promise<TransactionDto[]> {
    const transactions = await this.budgetsService.getBudgetTransactions({
      userId: user.id,
      budgetId: id,
      dateRange: {
        month: month ?? this.defaultMonth,
        year: year ?? this.defaultYear,
      },
    });

    return transactions.map((x) => TransactionDto.fromDomain(x));
  }

  @Post()
  @ApiOperation({ summary: 'Create a budget' })
  @ApiBody({ type: CreateBudgetDto })
  @ApiResponse({ status: 201, type: BudgetDto })
  @HttpCode(HttpStatus.CREATED)
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
  @ApiOperation({ summary: 'Update a budget' })
  @ApiParam({ name: 'id', format: 'uuid', description: 'Budget ID' })
  @ApiBody({ type: UpdateBudgetDto })
  @ApiResponse({ status: 200, type: BudgetDto })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
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
  @ApiOperation({ summary: 'Delete a budget' })
  @ApiParam({ name: 'id', format: 'uuid', description: 'Budget ID' })
  @ApiResponse({ status: 200, type: BudgetDto })
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @RequestUser() user: UserPrincipal,
  ): Promise<BudgetDto> {
    const budget = await this.budgetsService.deleteBudgetForUser({
      userId: user.id,
      budgetId: id,
    });
    // No need to get the final spent amount as this has been deleted
    console.log('Budget deleted', budget);
    return BudgetDto.fromDomain(budget, 0);
  }
}
