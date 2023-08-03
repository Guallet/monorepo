import { Module } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { AccountsResolver } from './accounts.resolver';
import { InstitutionsModule } from 'src/institutions/institutions.module';

@Module({
  imports: [InstitutionsModule],
  providers: [AccountsService, AccountsResolver],
})
export class AccountsModule {}
