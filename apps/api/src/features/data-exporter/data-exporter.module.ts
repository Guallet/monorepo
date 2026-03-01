import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { DataExporterController } from './data-exporter.controller';
import {
  ExportDataProcessor,
  EXPORT_DATA_QUEUE,
} from './processors/export-data.processor';
import { CsvExportEngine } from './engines/csv-export.engine';
import { OfeExportEngine } from './engines/ofe-export.engine';
import { JsonExportEngine } from './engines/json-export.engine';
import { AccountsModule } from '../accounts/accounts.module';
import { CategoriesModule } from '../categories/categories.module';
import { TransactionsModule } from '../transactions/transactions.module';
import { EmailModule } from '../email/email.module';
import { UsersModule } from '../users/users.module';
import { NotificationsModule } from '../notifications/notifications.module';

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
