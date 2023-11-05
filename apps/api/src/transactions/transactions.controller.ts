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
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionDto } from './dto/transaction.dto';
import { RequestUser } from 'src/core/auth/request-user.decorator';
import { UserPrincipal } from 'src/core/auth/user-principal';
import { ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('Transactions')
@Controller('transactions')
export class TransactionsController {
  private readonly logger = new Logger(TransactionsController.name);

  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
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
  async getUserAccounts(
    @RequestUser() user: UserPrincipal,
    // Cannot use a IntPipe since doesn't support optional query params
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
  ): Promise<TransactionDto[]> {
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
    return this.transactionsService.update(id, updateTransactionDto);
  }

  @Delete(':id')
  remove(@RequestUser() user: UserPrincipal, @Param('id') id: string) {
    return this.transactionsService.remove(id);
  }
}
