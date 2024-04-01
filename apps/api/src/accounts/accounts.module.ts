import { Module } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { InstitutionsModule } from 'src/institutions/institutions.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from './entities/account.entity';
import { AccountsController } from './accounts.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Account]), InstitutionsModule],
  providers: [AccountsService],
  exports: [AccountsService],
  controllers: [AccountsController],
})
export class AccountsModule {}
