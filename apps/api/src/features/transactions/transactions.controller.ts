import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Logger,
  BadRequestException,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionDto, TransactionsResultDto } from './dto/transaction.dto';
import { RequestUser } from 'src/auth/request-user.decorator';
import { UserPrincipal } from 'src/auth/user-principal';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import {
  TransactionsQueryFilter,
  transactionsQueryFilterSchema,
} from './dto/transaction.query';
import { ZodValidationPipe } from 'src/pipes/zodvalidator.pipe';
import { InboxTransactionDto } from './dto/inbox-transaction.dto';

@ApiTags('Transactions')
@Controller('transactions')
export class TransactionsController {
  private readonly logger = new Logger(TransactionsController.name);

  constructor(private readonly transactionsService: TransactionsService) {}

  @ApiQuery({
    name: 'page',
    type: Number,
    example: '1',
    description: 'The page to return. Default is 1',
    required: false,
  })
  @ApiQuery({
    name: 'pageSize',
    type: Number,
    example: '50',
    description: 'The number of items to return. Default is 50',
    required: false,
  })
  @ApiQuery({
    name: 'accounts',
    type: String,
    example: 'id1, id2, id3',
    description:
      'The id of the accounts to filter by. Is empty or null, use all accounts. Default is null',
    required: false,
  })
  @Get()
  async getTransactions(
    @RequestUser() user: UserPrincipal,
    @Query(new ZodValidationPipe(transactionsQueryFilterSchema))
    query: TransactionsQueryFilter,
  ): Promise<TransactionsResultDto> {
    if (!query) {
      throw new BadRequestException('Query Params are not valid');
    }
    const { page = 1, pageSize = 50, startDate, endDate, accounts } = query;

    console.log(`Transaction Query: ${JSON.stringify(query)}`);

    if (!Number.isInteger(+page) || !Number.isInteger(+pageSize)) {
      throw new BadRequestException(
        'Query Params `page` and `pageSize` must be integers greater than 0',
      );
    }

    if (startDate) startDate.setHours(0, 0, 0, 0);
    if (endDate) endDate.setHours(23, 59, 59, 999);

    if (accounts?.every((x) => x === '')) {
      throw new BadRequestException('Query Param `accounts` is not valid');
    }

    const [transactions, total] = await Promise.all([
      this.transactionsService.getUserTransactions({
        userId: user.id,
        page: page,
        pageSize: pageSize,
        accounts: accounts,
        startDate: startDate,
        endDate: endDate,
      }),
      this.transactionsService.getUserTransactionsCount({
        userId: user.id,
        filters: { accounts: accounts, startDate: startDate, endDate: endDate },
      }),
    ]);

    return TransactionsResultDto.fromDomain({
      transactions: transactions,
      total: total,
      hasMore: total >= page * pageSize,
      query: query,
    });
  }

  @Get('/inbox')
  async getUserTransactionInbox(
    @RequestUser() user: UserPrincipal,
  ): Promise<InboxTransactionDto[]> {
    const transactions =
      await this.transactionsService.getUserTransactionsInbox({
        userId: user.id,
      });
    return transactions.map((x) => InboxTransactionDto.fromDomain(x));
  }

  @Post()
  async create(
    @RequestUser() user: UserPrincipal,
    @Body() createTransactionDto: CreateTransactionDto,
  ): Promise<TransactionDto> {
    const transaction = await this.transactionsService.create({
      userId: user.id,
      dto: createTransactionDto,
    });
    return TransactionDto.fromDomain(transaction);
  }

  @Get(':id')
  async findOne(@RequestUser() user: UserPrincipal, @Param('id') id: string) {
    const transaction = await this.transactionsService.findOne(id);
    if (transaction.account.user_id !== user.id) {
      throw new NotFoundException('Transaction not found');
    }
    return TransactionDto.fromDomain(transaction);
  }

  @Patch(':id')
  update(
    @RequestUser() user: UserPrincipal,
    @Param('id') id: string,
    @Body() updateTransactionDto: UpdateTransactionDto,
  ) {
    return this.transactionsService.updateUserTransaction({
      dto: updateTransactionDto,
      user_id: user.id,
      transaction_id: id,
    });
  }

  @Delete(':id')
  remove(@RequestUser() user: UserPrincipal, @Param('id') id: string) {
    throw new Error('Method not implemented.');
  }
}
