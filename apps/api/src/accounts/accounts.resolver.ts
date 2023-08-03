import { Resolver, Args, Int, Query } from '@nestjs/graphql';
import { Account } from './models/account.model';
import { AccountsService } from './accounts.service';

@Resolver((of) => Account)
export class AccountsResolver {
  constructor(private accountsService: AccountsService) {}

  @Query((returns) => [Account], { name: 'accounts' })
  async getAllAccounts(): Promise<Account[]> {
    return this.accountsService.findAll();
  }

  @Query((returns) => Account, { name: 'account' })
  async getAccount(@Args('id', { type: () => Int }) id: string) {
    return this.accountsService.findOneById(id);
  }
}
