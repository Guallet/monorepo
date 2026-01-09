import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsDateString } from 'class-validator';
import { RecurringPaymentType, RecurrenceCadence } from '../entities/recurring-payment.entity';

export class CreateRecurringPaymentDto {
  @ApiProperty({ enum: RecurringPaymentType })
  @IsEnum(RecurringPaymentType)
  @IsNotEmpty()
  type: RecurringPaymentType;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  currency: string;

  @ApiProperty({ enum: RecurrenceCadence })
  @IsEnum(RecurrenceCadence)
  @IsNotEmpty()
  cadence: RecurrenceCadence;

  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  nextDate: Date;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  categoryId?: string;

  @ApiProperty({ required: false, description: 'Transaction ID to base this recurring payment on' })
  @IsString()
  @IsOptional()
  fromTransactionId?: string;
}
