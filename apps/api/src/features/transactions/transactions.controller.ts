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
  ParseUUIDPipe,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service.js';
import { CreateTransactionDto } from './dto/create-transaction.dto.js';
import { UpdateTransactionDto } from './dto/update-transaction.dto.js';
import {
  TransactionDto,
  TransactionsResultDto,
} from './dto/transaction.dto.js';
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
import { transactionsQueryFilterSchema } from './dto/transaction.query.js';
import type { TransactionsQueryFilter } from './dto/transaction.query.js';
import { ZodValidationPipe } from '../../pipes/zodvalidator.pipe.js';
import { InboxTransactionsResultDto } from './dto/inbox-transaction.dto.js';

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
    name: 'categories',
    type: String,
    required: false,
    description: 'Comma-separated category IDs',
  })
  @ApiQuery({
    name: 'startDate',
    type: String,
    format: 'date-time',
    required: false,
  })
  @ApiQuery({
    name: 'endDate',
    type: String,
    format: 'date-time',
    required: false,
  })
  @ApiOperation({ summary: 'List the current user’s transactions' })
  @ApiResponse({ status: 200, type: TransactionsResultDto })
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

    this.logger.log(`Transaction Query: ${JSON.stringify(query)}`);

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
  @ApiOperation({ summary: 'List the current user’s inbox transactions' })
  @ApiResponse({ status: 200, type: InboxTransactionsResultDto })
  @Get('/inbox')
  async getUserTransactionInbox(
    @RequestUser() user: UserPrincipal,
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 50,
  ): Promise<InboxTransactionsResultDto> {
    //In NestJS, query parameters are typically received as strings, so when you check if they
    // are integers we need to convert them into numbers using the + operator
    const pageNum = +page;
    const pageSizeNum = +pageSize;

    if (!Number.isInteger(pageNum) || !Number.isInteger(pageSizeNum)) {
      this.logger.error(
        `Invalid query params for inbox transactions: page=${page}, pageSize=${pageSize}`,
        {
          page,
          pageSize,
          isPageNum: Number.isInteger(pageNum),
          isPageSizeNum: Number.isInteger(pageSizeNum),
        },
      );
      throw new BadRequestException(
        'Query Params `page` and `pageSize` must be integers',
      );
    }

    if (pageNum <= 0 || pageSizeNum <= 0) {
      throw new BadRequestException(
        'Query Params `page` and `pageSize` must be greater than 0',
      );
    }

    const [transactions, total] = await Promise.all([
      this.transactionsService.getUserTransactionsInbox({
        userId: user.id,
        page: pageNum,
        pageSize: pageSizeNum,
      }),
      this.transactionsService.getUserTransactionsInboxCount({
        userId: user.id,
      }),
    ]);

    return InboxTransactionsResultDto.fromDomain({
      transactions: transactions,
      total: total,
      page: pageNum,
      pageSize: pageSizeNum,
    });
  }

  @Post()
  @ApiOperation({ summary: 'Create a transaction' })
  @ApiBody({ type: CreateTransactionDto })
  @ApiResponse({ status: 201, type: TransactionDto })
  async create(
    @RequestUser() user: UserPrincipal,
    @Body() createTransactionDto: CreateTransactionDto,
  ): Promise<TransactionDto> {
    const transaction = await this.transactionsService.create({
      userId: user.id,
      dto: createTransactionDto,
    });

    // TODO: Do we want to to update the balance of the account for each transaction?
    // or just based on the user settings?
    return TransactionDto.fromDomain(transaction);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a transaction by ID' })
  @ApiParam({ name: 'id', format: 'uuid', description: 'Transaction ID' })
  @ApiResponse({ status: 200, type: TransactionDto })
  async findOne(
    @RequestUser() user: UserPrincipal,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<TransactionDto> {
    const transaction = await this.transactionsService.findOne(id);
    if (transaction.account.user_id !== user.id) {
      throw new NotFoundException('Transaction not found');
    }
    return TransactionDto.fromDomain(transaction);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a transaction' })
  @ApiParam({ name: 'id', format: 'uuid', description: 'Transaction ID' })
  @ApiBody({ type: UpdateTransactionDto })
  @ApiResponse({ status: 200, type: TransactionDto })
  async async(
    @RequestUser() user: UserPrincipal,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTransactionDto: UpdateTransactionDto,
  ): Promise<TransactionDto> {
    const transaction = await this.transactionsService.updateUserTransaction({
      dto: updateTransactionDto,
      user_id: user.id,
      transaction_id: id,
    });
    return TransactionDto.fromDomain(transaction);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a transaction' })
  @ApiParam({ name: 'id', format: 'uuid', description: 'Transaction ID' })
  @ApiResponse({ status: 200, type: TransactionDto })
  async remove(
    @RequestUser() user: UserPrincipal,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<TransactionDto> {
    const transaction = await this.transactionsService.deleteUserTransaction({
      user_id: user.id,
      transaction_id: id,
    });
    return TransactionDto.fromDomain(transaction);
  }
}
