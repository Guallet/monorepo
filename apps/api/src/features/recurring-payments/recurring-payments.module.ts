import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecurringPaymentsService } from './recurring-payments.service';
import { RecurringPaymentsController } from './recurring-payments.controller';
import { RecurringPayment } from './entities/recurring-payment.entity';
import { RecurrenceDetectorService } from './recurrence-detector.service';
import { TransactionsModule } from '../transactions/transactions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RecurringPayment]),
    TransactionsModule,
  ],
  controllers: [RecurringPaymentsController],
  providers: [RecurringPaymentsService, RecurrenceDetectorService],
  exports: [RecurringPaymentsService],
})
export class RecurringPaymentsModule {}
