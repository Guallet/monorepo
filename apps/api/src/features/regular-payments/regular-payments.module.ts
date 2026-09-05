import { Module } from '@nestjs/common';
import { RegularPaymentsService } from './regular-payments.service.js';
import { RegularPaymentsController } from './regular-payments.controller.js';
import { RegularPayment } from './entities/regular-payment.entity.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from '../categories/entities/category.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([RegularPayment, Category])],
  controllers: [RegularPaymentsController],
  providers: [RegularPaymentsService],
})
export class RegularPaymentsModule {}
