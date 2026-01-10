import { Module } from '@nestjs/common';
import { RegularPaymentsService } from './regular-payments.service';
import { RegularPaymentsController } from './regular-payments.controller';
import { RegularPayment } from './entities/regular-payment.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from '../categories/entities/category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RegularPayment, Category])],
  controllers: [RegularPaymentsController],
  providers: [RegularPaymentsService],
})
export class RegularPaymentsModule {}
