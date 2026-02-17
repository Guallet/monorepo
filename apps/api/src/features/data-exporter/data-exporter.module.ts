import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { DataExporterController } from './data-exporter.controller';
import {
  CsvExportProcessor,
  CSV_EXPORT_QUEUE,
} from './processors/csv-export.processor';
import {
  OfeExportProcessor,
  OFE_EXPORT_QUEUE,
} from './processors/ofe-export.processor';
import {
  JsonExportProcessor,
  JSON_EXPORT_QUEUE,
} from './processors/json-export.processor';
import { AccountsModule } from '../accounts/accounts.module';
import { CategoriesModule } from '../categories/categories.module';
import { TransactionsModule } from '../transactions/transactions.module';
import { EmailModule } from '../email/email.module';
import { UsersModule } from '../users/users.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: CSV_EXPORT_QUEUE,
    }),
    BullModule.registerQueue({
      name: OFE_EXPORT_QUEUE,
    }),
    BullModule.registerQueue({
      name: JSON_EXPORT_QUEUE,
    }),
    AccountsModule,
    CategoriesModule,
    TransactionsModule,
    EmailModule,
    UsersModule,
    NotificationsModule,
  ],
  controllers: [DataExporterController],
  providers: [CsvExportProcessor, OfeExportProcessor, JsonExportProcessor],
})
export class DataExporterModule {}
