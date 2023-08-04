import { Module } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { AccountsResolver } from './accounts.resolver';
import { InstitutionsModule } from 'src/institutions/institutions.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from './models/account.model';
import { AccountsRepository } from './accounts.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Account]), InstitutionsModule],
  providers: [AccountsService, AccountsResolver, AccountsRepository],
  exports: [AccountsService],
})
export class AccountsModule {}
