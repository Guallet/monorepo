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
} from '@nestjs/common';
import { RequestUser } from 'src/auth/request-user.decorator';
import { UserPrincipal } from 'src/auth/user-principal';
import { AccountsService } from './accounts.service';
import { ApiTags } from '@nestjs/swagger';
import { CreateAccountRequest } from './dto/create-account-request.dto';
import { UpdateAccountRequest } from './dto/update-account-request.dto';
import { AccountDto } from './dto/account.dto';
import { TransactionsService } from 'src/features/transactions/transactions.service';
import { AccountChartsDto, ChartData } from './dto/account-charts.dto';
import { Transaction } from 'src/features/transactions/entities/transaction.entity';
import { TransactionDto } from 'src/features/transactions/dto/transaction.dto';

@ApiTags('Accounts')
@Controller('accounts')
export class AccountsController {
  private readonly logger = new Logger(AccountsController.name);

  constructor(
    private readonly accountsService: AccountsService,
    private readonly transactionsService: TransactionsService,
  ) {}

  @Get()
  async getUserAccounts(@RequestUser() user: UserPrincipal) {
    const accounts = await this.accountsService.findAllUserAccounts(user.id);
    return accounts.map((a) => AccountDto.fromDomain(a));
  }

  @Post()
  async create(
    @Body() createAccountDto: CreateAccountRequest,
    @RequestUser() user: UserPrincipal,
  ) {
    const entity = await this.accountsService.create({
      user_id: user.id,
      dto: createAccountDto,
    });
    return entity;
  }

  @Get(':id')
  async getAccountDetails(
    @RequestUser() user: UserPrincipal,
    @Param('id', ParseUUIDPipe) accountId: string,
  ) {
    const account = await this.accountsService.getUserAccount(
      user.id,
      accountId,
    );
    return AccountDto.fromDomain(account);
  }

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
  async getAccountChart(
    @RequestUser() user: UserPrincipal,
    @Param('id', ParseUUIDPipe) accountId: string,
  ): Promise<AccountChartsDto> {
    const account = await this.accountsService.getUserAccount(
      user.id,
      accountId,
    );

    // Get the transactions for the account in the last 6 months
    const sixMothsAgo = new Date();
    sixMothsAgo.setMonth(sixMothsAgo.getMonth() - 6);
    sixMothsAgo.setDate(1); // set the day to the first day of the month
    sixMothsAgo.setHours(0, 0, 0, 0); // set the time to 00:00:00.000

    const transactions = await this.transactionsService.getAccountTransactions({
      accountId: account.id,
      startDate: sixMothsAgo,
      endDate: new Date(),
    });

    // Group the transactions by month
    const transactionsByMonth = transactions.reduce((acc, transaction) => {
      const month = transaction.date.getMonth();
      const year = transaction.date.getFullYear();
      const key = `${year}-${month}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(transaction);
      return acc;
    }, {});

    // Convert the grouped transactions into AccountChartsDto format
    const accountCharts = Object.entries(transactionsByMonth).map(
      ([key, transactions]) => {
        const [year, month] = key.split('-');

        const totalIn = (transactions as Transaction[])
          .filter((t) => t.amount > 0)
          .reduce((acc, t) => acc + Number(t.amount), 0);

        const totalOut = (transactions as Transaction[])
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

    return AccountChartsDto.fromDomain(
      sixMothsAgo,
      new Date(),
      accountCharts.map(
        (d) =>
          new ChartData(
            d.month,
            d.year,
            Math.round(d.total_in * 100) / 100,
            Math.round(d.total_out * 100) / 100,
          ),
      ),
    );
  }

  @Patch(':id')
  update(
    @RequestUser() user: UserPrincipal,
    @Param('id') id: string,
    @Body() dto: UpdateAccountRequest,
  ) {
    return this.accountsService.update({
      accountId: id,
      dto: dto,
      userId: user.id,
    });
  }

  @Delete(':id')
  remove(
    @RequestUser() user: UserPrincipal,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.accountsService.removeUserAccount({
      account_id: id,
      user_id: user.id,
    });

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
