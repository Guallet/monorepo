import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsISO4217CurrencyCode,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  IsUUID,
  IsDateString,
  IsOptional,
} from 'class-validator';
import {
  RecurrenceCadence,
  RecurringPaymentType,
} from '../entities/regular-payment.entity.js';

export class CreateRegularPaymentDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  amount: number;

  @IsISO4217CurrencyCode()
  currency: string;

  @IsString()
  imageUrl?: string;

  @IsUUID()
  categoryId?: string;

  @ApiProperty({ enum: RecurrenceCadence })
  @IsEnum(RecurrenceCadence)
  @IsNotEmpty()
  cadence: RecurrenceCadence;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ enum: RecurringPaymentType })
  @IsEnum(RecurringPaymentType)
  @IsNotEmpty()
  type: RecurringPaymentType;
}
