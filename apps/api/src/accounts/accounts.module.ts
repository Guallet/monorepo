import { Module } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { AccountsResolver } from './accounts.resolver';

@Module({
  imports: [],
  providers: [AccountsService, AccountsResolver],
})
export class AccountsModule {}
