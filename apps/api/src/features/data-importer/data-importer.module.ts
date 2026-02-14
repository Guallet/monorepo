import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { DataImporterController } from './data-importer.controller';
import {
  CsvImportProcessor,
  CSV_IMPORT_QUEUE,
} from './processors/csv-import.processor';
import { AccountsModule } from '../accounts/accounts.module';
import { CategoriesModule } from '../categories/categories.module';
import { TransactionsModule } from '../transactions/transactions.module';
import { EmailModule } from '../email/email.module';
import { UsersModule } from '../users/users.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: CSV_IMPORT_QUEUE,
    }),
    AccountsModule,
    CategoriesModule,
    TransactionsModule,
    EmailModule,
    UsersModule,
    NotificationsModule,
  ],
  controllers: [DataImporterController],
  providers: [CsvImportProcessor],
})
export class DataImporterModule {}
