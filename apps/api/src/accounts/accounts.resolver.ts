import {
  Resolver,
  Args,
  Int,
  Query,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { Account } from './entities/account.entity';
import { AccountsService } from './accounts.service';
import { Institution } from 'src/institutions/entities/institution.entity';
import { InstitutionsService } from 'src/institutions/institutions.service';

@Resolver((of) => Account)
export class AccountsResolver {
  constructor(
    private accountsService: AccountsService,
    private institutionsService: InstitutionsService,
  ) {}

  @Query((returns) => [Account], { name: 'accounts' })
  async getAllAccounts(): Promise<Account[]> {
    return this.accountsService.findAll();
  }

  @Query((returns) => Account, { name: 'account' })
  async getAccount(@Args('id', { type: () => Int }) id: string) {
    return this.accountsService.findOneById(id);
  }

  @ResolveField((returns) => Institution, {
    name: 'institution',
    nullable: true,
  })
  async getInstitution(@Parent() account: Account) {
    const { institution } = account;
    if (institution) {
      return this.institutionsService.findOneById(institution.id);
    } else {
      return null;
    }
  }
}
