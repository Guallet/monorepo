import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { DataExporterController } from './data-exporter.controller.js';
import {
  ExportDataProcessor,
  EXPORT_DATA_QUEUE,
} from './processors/export-data.processor.js';
import { CsvExportEngine } from './engines/csv-export.engine.js';
import { OfeExportEngine } from './engines/ofe-export.engine.js';
import { JsonExportEngine } from './engines/json-export.engine.js';
import { AccountsModule } from '../accounts/accounts.module.js';
import { CategoriesModule } from '../categories/categories.module.js';
import { TransactionsModule } from '../transactions/transactions.module.js';
import { EmailModule } from '../email/email.module.js';
import { UsersModule } from '../users/users.module.js';
import { NotificationsModule } from '../notifications/notifications.module.js';

@Module({
  imports: [
    BullModule.registerQueue({
      name: EXPORT_DATA_QUEUE,
    }),
    AccountsModule,
    CategoriesModule,
    TransactionsModule,
    EmailModule,
    UsersModule,
    NotificationsModule,
  ],
  controllers: [DataExporterController],
  providers: [
    ExportDataProcessor,
    CsvExportEngine,
    OfeExportEngine,
    JsonExportEngine,
  ],
})
export class DataExporterModule {}
