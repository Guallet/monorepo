import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { RequestUser } from 'src/core/auth/requestuser.decorator';
import { UserPrincipal } from 'src/core/auth/user_principal';
import { TransactionDto } from './dto/transaction.dto';
import { TransactionsService } from './transactions.service';

@ApiTags('Transactions')
@Controller('transactions')
export class TransactionsController {
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

    const transactions = await this.transactionsService.getUserTransactions(
      user.id,
      page,
      pageSize,
    );
    return transactions.map((x) => new TransactionDto(x));
  }
}
