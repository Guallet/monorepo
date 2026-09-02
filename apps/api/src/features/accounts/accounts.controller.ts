import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { RequestUser } from '../../auth/request-user.decorator.js';
import { UserPrincipal } from '../../auth/user-principal.js';
import { AccountsService } from './accounts.service.js';
import {
  ApiBody,
  ApiExtraModels,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { CreateAccountRequest } from './dto/create-account-request.dto.js';
import { UpdateAccountRequest } from './dto/update-account-request.dto.js';
import { AccountDto } from './dto/account.dto.js';
import { TransactionsService } from '../../features/transactions/transactions.service.js';
import {
  AccountChartsDto,
  BalanceHistoryPoint,
  ChartData,
} from './dto/account-charts.dto.js';
import { Transaction } from '../../features/transactions/entities/transaction.entity.js';
import { TransactionDto } from '../../features/transactions/dto/transaction.dto.js';
import { OpenbankingService } from '../openbanking/openbanking.service.js';
import {
  AccountSource,
  toAccountSource,
} from './entities/accountSource.model.js';
import { NordigenAccountDto } from '../nordigen/dto/nordigen-account.dto.js';

function parseDateParam(value: string | undefined, name: string): Date | null {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new BadRequestException(`Invalid ${name} query parameter`);
  }

  return parsed;
}

@ApiTags('Accounts')
@ApiExtraModels(AccountDto, TransactionDto, NordigenAccountDto)
@Controller('accounts')
export class AccountsController {
  private readonly logger = new Logger(AccountsController.name);

  constructor(
    private readonly accountsService: AccountsService,
    private readonly transactionsService: TransactionsService,
    private readonly openBankingService: OpenbankingService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List the current user’s accounts' })
  @ApiResponse({ status: 200, type: [AccountDto] })
  async getUserAccounts(
    @RequestUser() user: UserPrincipal,
  ): Promise<AccountDto[]> {
    const accounts = await this.accountsService.findAllUserAccounts(user.id);
    return accounts.map((a) => AccountDto.fromDomain(a));
  }

  @Post()
  @ApiOperation({ summary: 'Create an account' })
  @ApiBody({ type: CreateAccountRequest })
  @ApiResponse({ status: 201, type: AccountDto })
  async create(
    @Body() createAccountDto: CreateAccountRequest,
    @RequestUser() user: UserPrincipal,
  ): Promise<AccountDto> {
    const entity = await this.accountsService.create({
      user_id: user.id,
      dto: createAccountDto,
    });
    return AccountDto.fromDomain(entity);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an account by ID' })
  @ApiParam({ name: 'id', format: 'uuid', description: 'Account ID' })
  @ApiResponse({ status: 200, type: AccountDto })
  async getAccountDetails(
    @RequestUser() user: UserPrincipal,
    @Param('id', ParseUUIDPipe) accountId: string,
  ): Promise<AccountDto> {
    const account = await this.accountsService.getUserAccount(
      user.id,
      accountId,
    );
    return AccountDto.fromDomain(account);
  }

  @Get(':id/transactions')
  @ApiOperation({
    summary: 'List an account’s transactions for the current month',
  })
  @ApiParam({ name: 'id', format: 'uuid', description: 'Account ID' })
  @ApiResponse({ status: 200, type: [TransactionDto] })
  // Get the transactions for the account in the current month
  async getAccountTransactions(
    @RequestUser() user: UserPrincipal,
    @Param('id', ParseUUIDPipe) accountId: string,
  ): Promise<TransactionDto[]> {
    const account = await this.accountsService.getUserAccount(
      user.id,
      accountId,
    );

    // Get the transactions for the account in the last 6 months
    const startDate = new Date();
    startDate.setDate(1); // set the day to the first day of the month
    startDate.setHours(0, 0, 0, 0); // set the time to 00:00:00.000

    const transactions = await this.transactionsService.getAccountTransactions({
      accountId: account.id,
      startDate: startDate,
      endDate: new Date(),
    });

    return transactions.map((x) => TransactionDto.fromDomain(x));
  }

  @Get(':id/charts')
  @ApiOperation({ summary: 'Get account cash-flow and balance charts' })
  @ApiParam({ name: 'id', format: 'uuid', description: 'Account ID' })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    format: 'date-time',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    format: 'date-time',
  })
  @ApiResponse({ status: 200, type: AccountChartsDto })
  async getAccountChart(
    @RequestUser() user: UserPrincipal,
    @Param('id', ParseUUIDPipe) accountId: string,
    @Query('startDate') startDateParam?: string,
    @Query('endDate') endDateParam?: string,
  ): Promise<AccountChartsDto> {
    const account = await this.accountsService.getUserAccount(
      user.id,
      accountId,
    );

    const endDate = parseDateParam(endDateParam, 'endDate') ?? new Date();

    const startDate =
      parseDateParam(startDateParam, 'startDate') ??
      (() => {
        const d = new Date();
        d.setMonth(d.getMonth() - 3);
        d.setDate(1);
        d.setHours(0, 0, 0, 0);
        return d;
      })();

    if (startDate > endDate) {
      throw new BadRequestException(
        'startDate must be before or equal to endDate',
      );
    }

    const transactions = await this.transactionsService.getAccountTransactions({
      accountId: account.id,
      startDate,
      endDate,
    });

    // Monthly in/out bucketing
    const transactionsByMonth = transactions.reduce(
      (acc, transaction) => {
        const month = transaction.date.getMonth();
        const year = transaction.date.getFullYear();
        const key = `${year}-${month}`;
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(transaction);
        return acc;
      },
      {} as Record<string, Transaction[]>,
    );

    const accountCharts = Object.entries(transactionsByMonth).map(
      ([key, txns]) => {
        const [year, month] = key.split('-');
        const totalIn = txns
          .filter((t) => t.amount > 0)
          .reduce((acc, t) => acc + Number(t.amount), 0);
        const totalOut = txns
          .filter((t) => t.amount < 0)
          .reduce((acc, t) => acc + Number(t.amount), 0);
        return {
          year: Number(year),
          month: Number(month),
          total_in: totalIn,
          total_out: totalOut,
        };
      },
    );

    // Balance history: reconstruct running balance from current account balance
    const currentBalance = Number(account.balance ?? 0);

    // Aggregate post-range sum in DB instead of materializing all transactions.
    const postRangeSum =
      await this.transactionsService.getAccountTransactionsSum({
        accountId: account.id,
        startDateExclusive: endDate,
        endDate: new Date(),
      });
    const balanceAtRangeEnd = currentBalance - Number(postRangeSum ?? 0);

    // Walk transactions oldest→newest, accumulating daily balance
    const sortedTxns = [...transactions].sort(
      (a, b) => a.date.getTime() - b.date.getTime(),
    );
    const balanceHistory: BalanceHistoryPoint[] = [];

    // Work backwards to get opening balance, then forward for history
    const reversedTxns = [...sortedTxns].reverse();
    let openingBalance = balanceAtRangeEnd;
    for (const t of reversedTxns) {
      openingBalance -= Number(t.amount);
    }

    const dailyMap = new Map<string, number>();
    for (const t of sortedTxns) {
      const dateKey = t.date.toISOString().split('T')[0];
      dailyMap.set(dateKey, (dailyMap.get(dateKey) ?? 0) + Number(t.amount));
    }

    // Build one balance point per day that has transactions
    const sortedDays = Array.from(dailyMap.keys()).sort((left, right) =>
      left.localeCompare(right),
    );
    for (const day of sortedDays) {
      openingBalance += dailyMap.get(day) ?? 0;
      balanceHistory.push(
        new BalanceHistoryPoint(day, Math.round(openingBalance * 100) / 100),
      );
    }

    return AccountChartsDto.fromDomain(
      startDate,
      endDate,
      accountCharts.map(
        (d) =>
          new ChartData(
            d.month,
            d.year,
            Math.round(d.total_in * 100) / 100,
            Math.round(d.total_out * 100) / 100,
          ),
      ),
      balanceHistory,
    );
  }

  /**
   * Retrieves the connected Open Banking account details for a specified Guallet account.
   * This endpoint is used to get the linked bank account information for accounts that are
   * synchronized with external banking institutions through Open Banking.
   *
   * @param {UserPrincipal} user - The authenticated user making the request
   * @param {string} accountId - UUID of the Guallet account
   * @throws {BadRequestException} When the account is not connected to Open Banking
   * @throws {NotFoundException} When the connected Open Banking account cannot be found
   * @returns {Promise<{connectedAccount: NordigenAccountDto}>} Object containing the connected Open Banking account details
   */
  @Get(':id/connection')
  @ApiOperation({
    summary: 'Get the Open Banking account linked to an account',
  })
  @ApiParam({ name: 'id', format: 'uuid', description: 'Account ID' })
  @ApiResponse({
    status: 200,
    schema: {
      type: 'object',
      properties: {
        connectedAccount: { $ref: getSchemaPath(NordigenAccountDto) },
      },
    },
  })
  async getConnectedAccountDetails(
    @RequestUser() user: UserPrincipal,
    @Param('id', ParseUUIDPipe) accountId: string,
  ): Promise<{ connectedAccount: NordigenAccountDto }> {
    const account = await this.accountsService.getUserAccount(
      user.id,
      accountId,
    );

    if (toAccountSource(account.source) !== AccountSource.SYNCED) {
      throw new BadRequestException('Account is not connected');
    }

    const obAccount = await this.openBankingService.getLinkedAccount({
      accountId: account.id,
    });

    if (!obAccount) {
      throw new NotFoundException('Connected account not found');
    }

    return {
      connectedAccount: NordigenAccountDto.fromEntity(obAccount),
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an account' })
  @ApiParam({ name: 'id', format: 'uuid', description: 'Account ID' })
  @ApiBody({ type: UpdateAccountRequest })
  @ApiResponse({ status: 200, type: AccountDto })
  async update(
    @RequestUser() user: UserPrincipal,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAccountRequest,
  ): Promise<AccountDto> {
    const updatedAccount = await this.accountsService.update({
      accountId: id,
      dto: dto,
      userId: user.id,
    });
    return AccountDto.fromDomain(updatedAccount);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an account' })
  @ApiParam({ name: 'id', format: 'uuid', description: 'Account ID' })
  @ApiResponse({ status: 200, type: AccountDto })
  async remove(
    @RequestUser() user: UserPrincipal,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<AccountDto> {
    const removedAccount = await this.accountsService.removeUserAccount({
      account_id: id,
      user_id: user.id,
    });
    return AccountDto.fromDomain(removedAccount);
    /*
    TODO: Delete user:
    - Transactions
    - Categories
    - Institutions
    - Connections
    - Rules
    */
  }
}
