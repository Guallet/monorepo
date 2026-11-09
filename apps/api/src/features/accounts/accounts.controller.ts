import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { RequestUser } from 'src/auth/request-user.decorator';
import { UserPrincipal } from 'src/auth/user-principal';
import { AccountsService } from './accounts.service';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiExtraModels,
  getSchemaPath,
} from '@nestjs/swagger';
import { CreateAccountRequest } from './dto/create-account-request.dto';
import { UpdateAccountRequest } from './dto/update-account-request.dto';
import { AccountDto } from './dto/account.dto';
import { TransactionsService } from 'src/features/transactions/transactions.service';
import {
  AccountChartsDto,
  BalanceHistoryPoint,
  ChartData,
} from './dto/account-charts.dto';
import { Transaction } from 'src/features/transactions/entities/transaction.entity';
import { TransactionDto } from 'src/features/transactions/dto/transaction.dto';
import { OpenbankingService } from '../openbanking/openbanking.service';
import { AccountConnectionDto } from './dto/account-connection.dto';
import { ZodValidationPipe } from 'src/pipes/zodvalidator.pipe';
import {
  accountChartQuerySchema,
  AccountChartQuery,
} from './dto/account-chart.query';

@ApiTags('Accounts')
@Controller('accounts')
export class AccountsController {
  private readonly logger = new Logger(AccountsController.name);

  constructor(
    private readonly accountsService: AccountsService,
    private readonly transactionsService: TransactionsService,
    private readonly openbankingService: OpenbankingService,
  ) {}

  @ApiOperation({ summary: 'getUserAccounts' })
  @ApiOkResponse({ type: () => AccountDto, isArray: true })
  @Get()
  async getUserAccounts(
    @RequestUser() user: UserPrincipal,
  ): Promise<AccountDto[]> {
    const accounts = await this.accountsService.findAllUserAccounts(user.id);
    return accounts.map((a) => AccountDto.fromDomain(a));
  }

  @ApiOperation({ summary: 'create' })
  @ApiCreatedResponse({ type: () => AccountDto })
  @ApiBody({ type: () => CreateAccountRequest })
  @Post()
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

  @ApiOperation({ summary: 'getAccountDetails' })
  @ApiOkResponse({ type: () => AccountDto })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @Get(':id')
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

  @Get(':id/connection')
  @ApiOperation({
    summary: 'Get account connection status and provider details',
  })
  @ApiExtraModels(AccountConnectionDto)
  @ApiOkResponse({
    description:
      'Flat connection details for linked accounts; {} when unlinked',
    schema: {
      oneOf: [
        { $ref: getSchemaPath(AccountConnectionDto) },
        { type: 'object', additionalProperties: false, maxProperties: 0 },
      ],
    },
  })
  @ApiNotFoundResponse({ description: 'Account not found for this user' })
  @ApiBadRequestResponse({ description: 'Invalid account UUID' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  async getConnectedAccountDetails(
    @RequestUser() user: UserPrincipal,
    @Param('id', ParseUUIDPipe) accountId: string,
  ): Promise<AccountConnectionDto | Record<string, never>> {
    const connection =
      await this.openbankingService.getConnectionFoGualletAccount(
        user.id,
        accountId,
      );
    if (!connection) return {};
    return AccountConnectionDto.fromDomain(connection);
  }

  @ApiOperation({ summary: 'getAccountTransactions' })
  @ApiOkResponse({ type: () => TransactionDto, isArray: true })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @Get(':id/transactions')
  // Get the transactions for the account in the current month
  async getAccountTransactions(
    @RequestUser() user: UserPrincipal,
    @Param('id', ParseUUIDPipe) accountId: string,
  ): Promise<TransactionDto[]> {
    const account = await this.accountsService.getUserAccount(
      user.id,
      accountId,
    );

    // Get the transactions for the account in the current month
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

  @ApiOperation({ summary: 'getAccountChart' })
  @ApiOkResponse({ type: () => AccountChartsDto })
  @ApiBadRequestResponse({ description: 'Invalid date query or date range' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiQuery({ name: 'startDate', type: String, required: false })
  @ApiQuery({ name: 'endDate', type: String, required: false })
  @Get(':id/charts')
  async getAccountChart(
    @RequestUser() user: UserPrincipal,
    @Param('id', ParseUUIDPipe) accountId: string,
    @Query(new ZodValidationPipe(accountChartQuerySchema))
    query: AccountChartQuery,
  ): Promise<AccountChartsDto> {
    const account = await this.accountsService.getUserAccount(
      user.id,
      accountId,
    );

    const { startDate, endDate } = query;

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
      ([key, transaction]) => {
        const [year, month] = key.split('-');
        const totalIn = transaction
          .filter((t) => t.amount > 0)
          .reduce((acc, t) => acc + Number(t.amount), 0);
        const totalOut = transaction
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
    const sortedTransactions = [...transactions].sort(
      (a, b) => a.date.getTime() - b.date.getTime(),
    );
    const balanceHistory: BalanceHistoryPoint[] = [];

    // Work backwards to get opening balance, then forward for history
    const reversedTransactions = [...sortedTransactions].reverse();
    let openingBalance = balanceAtRangeEnd;
    for (const t of reversedTransactions) {
      openingBalance -= Number(t.amount);
    }

    const dailyMap = new Map<string, number>();
    for (const t of sortedTransactions) {
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

  @ApiOperation({ summary: 'update' })
  @ApiOkResponse({ type: () => AccountDto })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiBody({ type: () => UpdateAccountRequest })
  @Patch(':id')
  async update(
    @RequestUser() user: UserPrincipal,
    @Param('id') id: string,
    @Body() dto: UpdateAccountRequest,
  ): Promise<AccountDto> {
    const updatedAccount = await this.accountsService.update({
      accountId: id,
      dto: dto,
      userId: user.id,
    });
    return AccountDto.fromDomain(updatedAccount);
  }

  @ApiOperation({ summary: 'remove' })
  @ApiOkResponse({ type: () => AccountDto })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @Delete(':id')
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
