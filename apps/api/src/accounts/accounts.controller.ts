import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { RequestUser } from 'src/core/auth/request-user.decorator';
import { UserPrincipal } from 'src/core/auth/user-principal';
import { AccountsService } from './accounts.service';
import { ApiTags } from '@nestjs/swagger';
import { CreateAccountRequest } from './dto/create-account-request.dto';

@ApiTags('Accounts')
@Controller('accounts')
export class AccountsController {
  private readonly logger = new Logger(AccountsController.name);

  constructor(private readonly accountsService: AccountsService) {}

  @Get()
  async getUserAccounts(@RequestUser() user: UserPrincipal) {
    const accounts = await this.accountsService.findAllUserAccounts(user.id);
    return accounts;
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
    return account;
  }

  //   @Get(':id/transactions')
  //   async getAccountTransactions(
  //     @RequestUser() user: UserPrincipal,
  //     @Param('id', ParseUUIDPipe) accountId: string,
  //   ): Promise<TransactionDto[]> {
  //     const account = await this.accountsService.getUserAccount(
  //       user.id,
  //       accountId,
  //     );

  //     const transactions = await this.transactionsService.getAccountTransactions(
  //       account.id,
  //       1,
  //       50,
  //     );

  //     return transactions.map((tx) => new TransactionDto(tx));
  //   }

  //   @Patch(':id')
  //   update(
  //     @RequestUser() user: UserPrincipal,
  //     @Param('id') id: string,
  //     @Body() dto: UpdateAccountRequest,
  //   ) {
  //     return this.accountsService.update({
  //       id: id,
  //       dto: dto,
  //       user_id: user.id,
  //     });
  //   }

  @Delete(':id')
  remove(
    @RequestUser() user: UserPrincipal,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.accountsService.removeUserAccount({
      account_id: id,
      user_id: user.id,
    });
  }
}
