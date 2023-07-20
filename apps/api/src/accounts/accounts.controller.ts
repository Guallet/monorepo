import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RequestUser } from 'src/core/auth/requestuser.decorator';
import { UserPrincipal } from 'src/core/auth/user_principal';
import { TransactionDto } from 'src/transactions/dto/transaction.dto';
import { TransactionsService } from 'src/transactions/transactions.service';
import { AccountsService } from './accounts.service';
import { AccountDto } from './dto/account.dto';
import { CreateAccountRequestDto } from './dto/create_account_request.dto';

@ApiTags('Accounts')
@Controller('accounts')
export class AccountsController {
  constructor(
    private readonly accountsService: AccountsService,
    private readonly transactionsService: TransactionsService,
  ) {}

  @Get()
  async getUserAccounts(
    @RequestUser() user: UserPrincipal,
  ): Promise<AccountDto[]> {
    const accounts = await this.accountsService.getUserAccounts(user.id);
    return accounts.map((x) => new AccountDto(x));
  }

  @Post()
  async create(
    @Body() createAccountDto: CreateAccountRequestDto,
    @RequestUser() user: UserPrincipal,
  ): Promise<AccountDto> {
    const entity = await this.accountsService.create(user.id, createAccountDto);
    return new AccountDto(entity);
  }

  @Get(':id')
  async getAccountDetails(
    @RequestUser() user: UserPrincipal,
    @Param('id', ParseUUIDPipe) accountId: string,
  ): Promise<AccountDto> {
    const account = await this.accountsService.getUserAccount(
      user.id,
      accountId,
    );
    return new AccountDto(account);
  }

  @Get(':id/transactions')
  async getAccountTransactions(
    @RequestUser() user: UserPrincipal,
    @Param('id', ParseUUIDPipe) accountId: string,
  ): Promise<TransactionDto[]> {
    const account = await this.accountsService.getUserAccount(
      user.id,
      accountId,
    );

    const transactions = await this.transactionsService.getAccountTransactions(
      account.id,
      1,
      50,
    );

    return transactions.map((tx) => new TransactionDto(tx));
  }
}
