import { Module } from '@nestjs/common';
import { DataImporterController } from './data-importer.controller';
import { DataImporterService } from './data-importer.service';
import { AccountsModule } from '../accounts/accounts.module';
import { CategoriesModule } from '../categories/categories.module';
import { TransactionsModule } from '../transactions/transactions.module';
import { EmailModule } from '../email/email.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    AccountsModule,
    CategoriesModule,
    TransactionsModule,
    EmailModule,
    UsersModule,
  ],
  controllers: [DataImporterController],
  providers: [DataImporterService],
})
export class DataImporterModule {}
