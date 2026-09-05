import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { DataImporterController } from './data-importer.controller.js';
import {
  ImportDataProcessor,
  IMPORT_DATA_QUEUE,
} from './processors/import-data.processor.js';
import { CsvImportEngine } from './engines/csv-import.engine.js';
import { OfeImportEngine } from './engines/ofe-import.engine.js';
import { JsonImportEngine } from './engines/json-import.engine.js';
import { AccountsModule } from '../accounts/accounts.module.js';
import { CategoriesModule } from '../categories/categories.module.js';
import { TransactionsModule } from '../transactions/transactions.module.js';
import { EmailModule } from '../email/email.module.js';
import { UsersModule } from '../users/users.module.js';
import { NotificationsModule } from '../notifications/notifications.module.js';

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
