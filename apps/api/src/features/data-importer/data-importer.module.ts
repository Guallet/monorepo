import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { DataImporterController } from './data-importer.controller';
import {
  ImportDataProcessor,
  IMPORT_DATA_QUEUE,
} from './processors/import-data.processor';
import { CsvImportEngine } from './engines/csv-import.engine';
import { OfeImportEngine } from './engines/ofe-import.engine';
import { JsonImportEngine } from './engines/json-import.engine';
import { AccountsModule } from '../accounts/accounts.module';
import { CategoriesModule } from '../categories/categories.module';
import { TransactionsModule } from '../transactions/transactions.module';
import { EmailModule } from '../email/email.module';
import { UsersModule } from '../users/users.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: IMPORT_DATA_QUEUE,
    }),
    AccountsModule,
    CategoriesModule,
    TransactionsModule,
    EmailModule,
    UsersModule,
    NotificationsModule,
  ],
  controllers: [DataImporterController],
  providers: [
    ImportDataProcessor,
    CsvImportEngine,
    OfeImportEngine,
    JsonImportEngine,
  ],
})
export class DataImporterModule {}
