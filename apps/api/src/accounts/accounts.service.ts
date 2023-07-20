import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateAccountRequestDto } from './dto/create_account_request.dto';
import { Account, AccountType } from './entities/account.entity';
import { AccountRepository } from './repositories/account.repository';

@Injectable()
export class AccountsService {
  private readonly logger = new Logger(AccountsService.name);

  constructor(private accountRepository: AccountRepository) {}

  async getUserAccounts(userId: string): Promise<Account[]> {
    return await this.accountRepository.findByUserId(userId);
  }

  async create(
    userId: string,
    createAccountDto: CreateAccountRequestDto,
  ): Promise<Account> {
    return await this.accountRepository.create(
      userId,
      createAccountDto.name,
      AccountType[createAccountDto.account_type],
      createAccountDto.initial_balance,
      createAccountDto.currency,
    );
  }

  async getUserAccount(userId: string, accountId: string): Promise<Account> {
    const account = await this.accountRepository.find(accountId);
    if (account == null) {
      throw new NotFoundException();
    }
    if (account.user_id != userId) {
      throw new ForbiddenException();
    } else {
      return account;
    }
  }
}
