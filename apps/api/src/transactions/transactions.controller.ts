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
  ParseIntPipe,
  ParseArrayPipe,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionDto, TransactionsResultDto } from './dto/transaction.dto';
import { RequestUser } from 'src/core/auth/request-user.decorator';
import { UserPrincipal } from 'src/core/auth/user-principal';
import { ApiQuery, ApiTags } from '@nestjs/swagger';

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
    @Query(
      'page',
      new ParseIntPipe({
        optional: true,
      }),
    )
    page: number,
    @Query(
      'pageSize',
      new ParseIntPipe({
        optional: true,
      }),
    )
    pageSize: number,

    @Query(
      'accounts',
      new ParseArrayPipe({
        optional: true,
        items: String,
        separator: ',',
      }),
    )
    accounts: string[],
  ): Promise<TransactionsResultDto> {
    if (page === null || page == undefined) {
      page = 1;
    }
    if (pageSize === null || pageSize == undefined) {
      pageSize = 50;
    }

    if (!Number.isInteger(+page)) {
      throw new BadRequestException(
        'Query Param `page` is not valid. Has to be a number greater than 0',
      );
    }
    if (!Number.isInteger(+pageSize)) {
      throw new BadRequestException(
        'Query Param `pageSize` is not valid. Has to be a number greater than 0',
      );
    }

    const transactions = await this.transactionsService.getUserTransactions({
      userId: user.id,
      page: page,
      pageSize: pageSize,
      accounts: accounts,
    });
    const total = await this.transactionsService.getUserTransactionsCount(
      user.id,
    );

    return TransactionsResultDto.fromDomain({
      transactions: transactions,
      total: total,
      page: page,
      pageSize: pageSize,
      hasMore: total >= page * pageSize,
    });
  }

  @Get('/inbox')
  async getUserTransactionInbox(
    @RequestUser() user: UserPrincipal,
  ): Promise<TransactionDto[]> {
    const transactions =
      await this.transactionsService.getUserTransactionsInbox({
        userId: user.id,
      });
    return transactions.map((x) => TransactionDto.fromDomain(x));
  }

  @Post()
  create(
    @RequestUser() user: UserPrincipal,
    @Body() createTransactionDto: CreateTransactionDto,
  ) {
    return this.transactionsService.create(createTransactionDto);
  }

  @Get()
  async findAll(@RequestUser() user: UserPrincipal): Promise<TransactionDto[]> {
    const transactions = await this.transactionsService.findAll();
    return transactions.map((x) => TransactionDto.fromDomain(x));
  }

  @Get(':id')
  findOne(@RequestUser() user: UserPrincipal, @Param('id') id: string) {
    return this.transactionsService.findOne(id);
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
    return this.transactionsService.remove(id);
  }
}
